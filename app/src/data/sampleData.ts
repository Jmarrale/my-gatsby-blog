import { brand } from "../brand";
import { uid } from "../lib/id";
import { DEFAULT_SKILLS } from "./defaultSkills";
import type { Database } from "./DataStore";
import type { Lesson, Payment, Promotion, Student } from "./types";

// Builds a realistic starter dataset so the app is explorable with zero setup.
export function buildSampleData(): Database {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const at = (offsetDays: number, hour = 17, minute = 0): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  const dateOnly = (offsetDays: number): string => at(offsetDays).slice(0, 10);
  const monthsAgo = (n: number): string => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - n);
    return d.toISOString().slice(0, 10);
  };
  const yearsAgo = (n: number): string => {
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - n);
    return d.toISOString().slice(0, 10);
  };
  const now = new Date().toISOString();

  const alex: Student = {
    id: uid(),
    name: "Alex Costa",
    belt: "Blue",
    stripes: 2,
    email: "alex.costa@example.com",
    phone: "555-0142",
    startDate: monthsAgo(14),
    notes: "Competing at the next local open. Working takedowns.",
    defaultRateCents: 8000,
    isActive: true,
    createdAt: now,
  };
  const maria: Student = {
    id: uid(),
    name: "Maria Santos",
    belt: "White",
    stripes: 3,
    email: "maria.s@example.com",
    phone: "555-0188",
    startDate: monthsAgo(5),
    notes: "Focus on fundamentals and confidence. Prefers morning sessions.",
    defaultRateCents: 7000,
    isActive: true,
    createdAt: now,
  };
  const jordan: Student = {
    id: uid(),
    name: "Jordan Lee",
    belt: "Purple",
    stripes: 0,
    email: "jordan.lee@example.com",
    phone: "555-0119",
    startDate: yearsAgo(4),
    notes: "Advanced. Drilling competition-specific scenarios.",
    defaultRateCents: 9500,
    isActive: true,
    createdAt: now,
  };

  const L = (
    studentId: string,
    startsAt: string,
    status: Lesson["status"],
    location: string,
    techniques: string,
    rateCents: number,
    notes = "",
  ): Lesson => ({
    id: uid(),
    studentId,
    startsAt,
    durationMinutes: 60,
    status,
    techniques,
    notes,
    location,
    rateCents,
    createdAt: now,
  });

  const P = (
    studentId: string,
    paidOn: string,
    amountCents: number,
    method: Payment["method"],
    lessonsCovered: number,
    note = "",
  ): Payment => ({
    id: uid(),
    studentId,
    paidOn,
    amountCents,
    method,
    lessonsCovered,
    note,
    createdAt: now,
  });

  const Pr = (
    studentId: string,
    promotedOn: string,
    belt: Promotion["belt"],
    stripes: number,
    note = "",
  ): Promotion => ({ id: uid(), studentId, promotedOn, belt, stripes, note });

  const students = [alex, maria, jordan];

  const lessons: Lesson[] = [
    L(alex.id, at(-18), "completed", "Main mat", "Single leg, sprawl defense", 8000),
    L(alex.id, at(-11), "completed", "Main mat", "Guard retention, hip escape", 8000),
    L(alex.id, at(-4), "completed", "Main mat", "Knee cut pass, underhook", 8000),
    L(alex.id, at(2), "scheduled", "Main mat", "Leg drag, back takes", 8000),
    L(alex.id, at(9), "scheduled", "Main mat", "", 8000),
    L(maria.id, at(-7, 9), "completed", "Studio B", "Mount escapes, bridge & roll", 7000),
    L(maria.id, at(1, 9), "scheduled", "Studio B", "Closed guard basics", 7000),
    L(jordan.id, at(-25), "completed", "Main mat", "Berimbolo, leg lock entries", 9500),
    L(jordan.id, at(-12), "completed", "Main mat", "Pressure passing", 9500),
    L(jordan.id, at(-3), "no_show", "Main mat", "", 9500, "Did not show — follow up."),
    L(jordan.id, at(3, 18), "scheduled", "Main mat", "Comp simulation rounds", 9500),
  ];

  const payments: Payment[] = [
    P(alex.id, dateOnly(-20), 80000, "venmo", 10, "10-lesson package"),
    P(maria.id, dateOnly(-7), 7000, "cash", 1, "Single lesson"),
    P(jordan.id, dateOnly(-30), 47500, "zelle", 5, "5-lesson package"),
  ];

  const promotions: Promotion[] = [
    Pr(alex.id, monthsAgo(14), "White", 0, "Started training"),
    Pr(alex.id, monthsAgo(6), "Blue", 0, "Promoted to blue belt"),
    Pr(alex.id, monthsAgo(2), "Blue", 2, "Second stripe"),
    Pr(maria.id, monthsAgo(5), "White", 0, "Started training"),
    Pr(maria.id, monthsAgo(1), "White", 3, "Third stripe"),
    Pr(jordan.id, yearsAgo(1), "Purple", 0, "Promoted to purple belt"),
  ];

  const skills = DEFAULT_SKILLS.map((s) => ({ id: uid(), ...s }));

  const studentSkills = [
    { id: uid(), studentId: maria.id, skillId: skills[0].id, status: "proficient" as const, updatedAt: now },
    { id: uid(), studentId: maria.id, skillId: skills[1].id, status: "drilling" as const, updatedAt: now },
    { id: uid(), studentId: alex.id, skillId: skills[4].id, status: "drilling" as const, updatedAt: now },
    { id: uid(), studentId: alex.id, skillId: skills[0].id, status: "proficient" as const, updatedAt: now },
  ];

  return {
    profile: {
      id: "local-owner",
      businessName: brand.defaultBusinessName,
      defaultRateCents: 8000,
      currency: "USD",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    },
    students,
    lessons,
    payments,
    promotions,
    skills,
    studentSkills,
  };
}
