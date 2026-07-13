// Pure billing/progress math. No side effects — heavily unit-tested.
import type { Lesson, Payment, Profile, Student } from "../data/types";
import { isSameMonth, startOfDay } from "./dates";

/** Effective per-lesson rate: lesson snapshot → student default → profile default → 0. */
export function rateFor(
  lesson: Lesson,
  student: Student | undefined,
  profile: Profile | undefined,
): number {
  if (lesson.rateCents != null) return lesson.rateCents;
  if (student?.defaultRateCents != null) return student.defaultRateCents;
  return profile?.defaultRateCents ?? 0;
}

export function completedLessons(lessons: Lesson[]): Lesson[] {
  return lessons.filter((l) => l.status === "completed");
}

export function upcomingLessons(
  lessons: Lesson[],
  now: Date = new Date(),
): Lesson[] {
  const from = startOfDay(now).getTime();
  return lessons
    .filter((l) => l.status === "scheduled" && new Date(l.startsAt).getTime() >= from)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

/** Total owed = sum of the effective rate over completed lessons. */
export function amountOwed(
  lessons: Lesson[],
  student: Student | undefined,
  profile: Profile | undefined,
): number {
  return completedLessons(lessons).reduce(
    (sum, l) => sum + rateFor(l, student, profile),
    0,
  );
}

export function amountPaid(payments: Payment[]): number {
  return payments.reduce((sum, p) => sum + (p.amountCents || 0), 0);
}

/** Positive = student owes; negative = credit/prepaid. */
export function balance(
  lessons: Lesson[],
  payments: Payment[],
  student: Student | undefined,
  profile: Profile | undefined,
): number {
  return amountOwed(lessons, student, profile) - amountPaid(payments);
}

/** Prepaid lessons remaining (display lens): package credits − completed count. */
export function lessonsRemaining(
  lessons: Lesson[],
  payments: Payment[],
): number {
  const prepaid = payments.reduce((s, p) => s + (p.lessonsCovered || 0), 0);
  return prepaid - completedLessons(lessons).length;
}

export function revenueThisMonth(
  payments: Payment[],
  now: Date = new Date(),
): number {
  return payments
    .filter((p) => isSameMonth(p.paidOn, now))
    .reduce((s, p) => s + (p.amountCents || 0), 0);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const s = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return s || "?";
}
