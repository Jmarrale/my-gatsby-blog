// Domain models. Money is stored as integer cents everywhere and formatted
// only at the UI edge (see lib/money.ts).

export const BELTS = ["White", "Blue", "Purple", "Brown", "Black"] as const;
export type Belt = (typeof BELTS)[number];

export const LESSON_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "venmo", "zelle", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const SKILL_STATUSES = [
  "not_started",
  "drilling",
  "proficient",
] as const;
export type SkillStatus = (typeof SKILL_STATUSES)[number];

export interface Profile {
  id: string;
  businessName: string;
  defaultRateCents: number;
  currency: string;
  timezone: string;
}

export interface Student {
  id: string;
  name: string;
  belt: Belt;
  stripes: number;
  email: string;
  phone: string;
  startDate: string; // ISO date (yyyy-mm-dd)
  notes: string;
  defaultRateCents: number | null;
  isActive: boolean;
  createdAt: string; // ISO datetime
}

export interface Lesson {
  id: string;
  studentId: string;
  startsAt: string; // ISO datetime
  durationMinutes: number;
  status: LessonStatus;
  techniques: string;
  notes: string;
  location: string;
  rateCents: number | null; // snapshot; null → fall back to student/profile
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  paidOn: string; // ISO date
  amountCents: number;
  method: PaymentMethod;
  lessonsCovered: number; // for prepaid packages; 0 = not a package
  note: string;
  createdAt: string;
}

export interface Promotion {
  id: string;
  studentId: string;
  promotedOn: string; // ISO date
  belt: Belt;
  stripes: number;
  note: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  beltLevel: Belt | "";
  sort: number;
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  status: SkillStatus;
  updatedAt: string;
}

// Create/update payloads: omit server-managed fields.
export type NewStudent = Omit<Student, "id" | "createdAt">;
export type NewLesson = Omit<Lesson, "id" | "createdAt">;
export type NewPayment = Omit<Payment, "id" | "createdAt">;
export type NewPromotion = Omit<Promotion, "id">;
