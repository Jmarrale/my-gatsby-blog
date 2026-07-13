import { brand } from "../brand";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SKILLS } from "./defaultSkills";
import type { DataStore } from "./DataStore";
import { getSupabase } from "./supabaseClient";
import type {
  Belt,
  Lesson,
  LessonStatus,
  NewLesson,
  NewPayment,
  NewPromotion,
  NewStudent,
  Payment,
  PaymentMethod,
  Profile,
  Promotion,
  Skill,
  SkillStatus,
  Student,
  StudentSkill,
} from "./types";

// Row shapes (snake_case) as stored in Postgres.
type StudentRow = {
  id: string; name: string; belt: Belt; stripes: number; email: string | null;
  phone: string | null; start_date: string | null; notes: string | null;
  default_rate_cents: number | null; is_active: boolean; created_at: string;
};
type LessonRow = {
  id: string; student_id: string; starts_at: string; duration_minutes: number;
  status: LessonStatus; techniques: string | null; notes: string | null;
  location: string | null; rate_cents: number | null; created_at: string;
};
type PaymentRow = {
  id: string; student_id: string; paid_on: string; amount_cents: number;
  method: PaymentMethod; lessons_covered: number; note: string | null; created_at: string;
};
type PromotionRow = {
  id: string; student_id: string; promoted_on: string; belt: Belt; stripes: number; note: string | null;
};
type SkillRow = { id: string; name: string; category: string | null; belt_level: Belt | "" | null; sort: number };
type StudentSkillRow = { id: string; student_id: string; skill_id: string; status: SkillStatus; updated_at: string };
type ProfileRow = { id: string; business_name: string | null; default_rate_cents: number | null; currency: string | null; timezone: string | null };

const toStudent = (r: StudentRow): Student => ({
  id: r.id, name: r.name, belt: r.belt, stripes: r.stripes, email: r.email ?? "",
  phone: r.phone ?? "", startDate: r.start_date ?? "", notes: r.notes ?? "",
  defaultRateCents: r.default_rate_cents, isActive: r.is_active, createdAt: r.created_at,
});
const toLesson = (r: LessonRow): Lesson => ({
  id: r.id, studentId: r.student_id, startsAt: r.starts_at, durationMinutes: r.duration_minutes,
  status: r.status, techniques: r.techniques ?? "", notes: r.notes ?? "", location: r.location ?? "",
  rateCents: r.rate_cents, createdAt: r.created_at,
});
const toPayment = (r: PaymentRow): Payment => ({
  id: r.id, studentId: r.student_id, paidOn: r.paid_on, amountCents: r.amount_cents,
  method: r.method, lessonsCovered: r.lessons_covered, note: r.note ?? "", createdAt: r.created_at,
});
const toPromotion = (r: PromotionRow): Promotion => ({
  id: r.id, studentId: r.student_id, promotedOn: r.promoted_on, belt: r.belt, stripes: r.stripes, note: r.note ?? "",
});
const toSkill = (r: SkillRow): Skill => ({
  id: r.id, name: r.name, category: r.category ?? "", beltLevel: (r.belt_level ?? "") as Belt | "", sort: r.sort,
});
const toStudentSkill = (r: StudentSkillRow): StudentSkill => ({
  id: r.id, studentId: r.student_id, skillId: r.skill_id, status: r.status, updatedAt: r.updated_at,
});

const studentToRow = (s: Partial<NewStudent>) => ({
  name: s.name, belt: s.belt, stripes: s.stripes, email: s.email, phone: s.phone,
  start_date: s.startDate || null, notes: s.notes, default_rate_cents: s.defaultRateCents,
  is_active: s.isActive,
});
const lessonToRow = (l: Partial<NewLesson>) => ({
  student_id: l.studentId, starts_at: l.startsAt, duration_minutes: l.durationMinutes,
  status: l.status, techniques: l.techniques, notes: l.notes, location: l.location, rate_cents: l.rateCents,
});
const paymentToRow = (p: Partial<NewPayment>) => ({
  student_id: p.studentId, paid_on: p.paidOn, amount_cents: p.amountCents, method: p.method,
  lessons_covered: p.lessonsCovered, note: p.note,
});

function clean<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Supabase (Postgres) implementation. Row-Level Security scopes all data to the owner. */
export class SupabaseStore implements DataStore {
  private sb: SupabaseClient;
  constructor(client: SupabaseClient = getSupabase()) {
    this.sb = client;
  }

  private async unwrap<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
    const { data, error } = await p;
    if (error) throw error;
    return data as T;
  }

  async getProfile(): Promise<Profile> {
    const { data: userData } = await this.sb.auth.getUser();
    const uid = userData.user?.id;
    const { data } = await this.sb.from("profiles").select("*").limit(1).maybeSingle();
    if (data) {
      const r = data as ProfileRow;
      return {
        id: r.id, businessName: r.business_name ?? brand.defaultBusinessName,
        defaultRateCents: r.default_rate_cents ?? 0, currency: r.currency ?? "USD",
        timezone: r.timezone ?? "UTC",
      };
    }
    // First login: create a default profile row and seed the skills catalog.
    const created = await this.unwrap<ProfileRow>(
      this.sb.from("profiles").insert({
        id: uid, business_name: brand.defaultBusinessName, default_rate_cents: 0,
        currency: "USD", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      }).select().single(),
    );
    await this.sb.from("skills").insert(
      DEFAULT_SKILLS.map((s) => ({
        name: s.name, category: s.category, belt_level: s.beltLevel, sort: s.sort,
      })),
    );
    return {
      id: created.id, businessName: created.business_name ?? brand.defaultBusinessName,
      defaultRateCents: created.default_rate_cents ?? 0, currency: created.currency ?? "USD",
      timezone: created.timezone ?? "UTC",
    };
  }
  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    const row = clean({
      business_name: patch.businessName, default_rate_cents: patch.defaultRateCents,
      currency: patch.currency, timezone: patch.timezone,
    });
    const data = await this.unwrap<ProfileRow>(
      this.sb.from("profiles").update(row).neq("id", "").select().single(),
    );
    return {
      id: data.id, businessName: data.business_name ?? brand.defaultBusinessName,
      defaultRateCents: data.default_rate_cents ?? 0, currency: data.currency ?? "USD",
      timezone: data.timezone ?? "UTC",
    };
  }

  async listStudents(): Promise<Student[]> {
    const rows = await this.unwrap<StudentRow[]>(
      this.sb.from("students").select("*").order("name"),
    );
    return rows.map(toStudent);
  }
  async getStudent(id: string): Promise<Student | null> {
    const { data } = await this.sb.from("students").select("*").eq("id", id).maybeSingle();
    return data ? toStudent(data as StudentRow) : null;
  }
  async createStudent(input: NewStudent): Promise<Student> {
    const data = await this.unwrap<StudentRow>(
      this.sb.from("students").insert(studentToRow(input)).select().single(),
    );
    return toStudent(data);
  }
  async updateStudent(id: string, patch: Partial<NewStudent>): Promise<Student> {
    const data = await this.unwrap<StudentRow>(
      this.sb.from("students").update(clean(studentToRow(patch))).eq("id", id).select().single(),
    );
    return toStudent(data);
  }
  async deleteStudent(id: string): Promise<void> {
    await this.unwrap(this.sb.from("students").delete().eq("id", id));
  }

  async listLessons(): Promise<Lesson[]> {
    const rows = await this.unwrap<LessonRow[]>(
      this.sb.from("lessons").select("*").order("starts_at"),
    );
    return rows.map(toLesson);
  }
  async lessonsForStudent(studentId: string): Promise<Lesson[]> {
    const rows = await this.unwrap<LessonRow[]>(
      this.sb.from("lessons").select("*").eq("student_id", studentId).order("starts_at"),
    );
    return rows.map(toLesson);
  }
  async createLesson(input: NewLesson): Promise<Lesson> {
    const data = await this.unwrap<LessonRow>(
      this.sb.from("lessons").insert(lessonToRow(input)).select().single(),
    );
    return toLesson(data);
  }
  async updateLesson(id: string, patch: Partial<NewLesson>): Promise<Lesson> {
    const data = await this.unwrap<LessonRow>(
      this.sb.from("lessons").update(clean(lessonToRow(patch))).eq("id", id).select().single(),
    );
    return toLesson(data);
  }
  async deleteLesson(id: string): Promise<void> {
    await this.unwrap(this.sb.from("lessons").delete().eq("id", id));
  }

  async listPayments(): Promise<Payment[]> {
    const rows = await this.unwrap<PaymentRow[]>(
      this.sb.from("payments").select("*").order("paid_on", { ascending: false }),
    );
    return rows.map(toPayment);
  }
  async paymentsForStudent(studentId: string): Promise<Payment[]> {
    const rows = await this.unwrap<PaymentRow[]>(
      this.sb.from("payments").select("*").eq("student_id", studentId).order("paid_on", { ascending: false }),
    );
    return rows.map(toPayment);
  }
  async createPayment(input: NewPayment): Promise<Payment> {
    const data = await this.unwrap<PaymentRow>(
      this.sb.from("payments").insert(paymentToRow(input)).select().single(),
    );
    return toPayment(data);
  }
  async updatePayment(id: string, patch: Partial<NewPayment>): Promise<Payment> {
    const data = await this.unwrap<PaymentRow>(
      this.sb.from("payments").update(clean(paymentToRow(patch))).eq("id", id).select().single(),
    );
    return toPayment(data);
  }
  async deletePayment(id: string): Promise<void> {
    await this.unwrap(this.sb.from("payments").delete().eq("id", id));
  }

  async promotionsForStudent(studentId: string): Promise<Promotion[]> {
    const rows = await this.unwrap<PromotionRow[]>(
      this.sb.from("promotions").select("*").eq("student_id", studentId).order("promoted_on", { ascending: false }),
    );
    return rows.map(toPromotion);
  }
  async createPromotion(input: NewPromotion): Promise<Promotion> {
    const data = await this.unwrap<PromotionRow>(
      this.sb.from("promotions").insert({
        student_id: input.studentId, promoted_on: input.promotedOn,
        belt: input.belt, stripes: input.stripes, note: input.note,
      }).select().single(),
    );
    return toPromotion(data);
  }
  async deletePromotion(id: string): Promise<void> {
    await this.unwrap(this.sb.from("promotions").delete().eq("id", id));
  }

  async listSkills(): Promise<Skill[]> {
    const rows = await this.unwrap<SkillRow[]>(
      this.sb.from("skills").select("*").order("sort"),
    );
    return rows.map(toSkill);
  }
  async studentSkills(studentId: string): Promise<StudentSkill[]> {
    const rows = await this.unwrap<StudentSkillRow[]>(
      this.sb.from("student_skills").select("*").eq("student_id", studentId),
    );
    return rows.map(toStudentSkill);
  }
  async setStudentSkill(studentId: string, skillId: string, status: SkillStatus): Promise<StudentSkill> {
    const data = await this.unwrap<StudentSkillRow>(
      this.sb.from("student_skills").upsert(
        { student_id: studentId, skill_id: skillId, status, updated_at: new Date().toISOString() },
        { onConflict: "student_id,skill_id" },
      ).select().single(),
    );
    return toStudentSkill(data);
  }
}
