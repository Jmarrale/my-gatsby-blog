import { uid } from "../lib/id";
import type { Database, DataStore } from "./DataStore";
import { buildSampleData } from "./sampleData";
import type {
  Lesson,
  NewLesson,
  NewPayment,
  NewPromotion,
  NewStudent,
  Payment,
  Profile,
  Promotion,
  Skill,
  SkillStatus,
  Student,
  StudentSkill,
} from "./types";

const STORAGE_KEY = "tatami.v1";

/** localStorage-backed store, seeded with sample data on first run. */
export class LocalStore implements DataStore {
  private db: Database;

  constructor() {
    this.db = this.load();
  }

  private load(): Database {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Database;
    } catch {
      /* ignore corrupt/unavailable storage */
    }
    const seeded = buildSampleData();
    this.persist(seeded);
    return seeded;
  }

  private persist(db: Database = this.db): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      /* storage may be unavailable (e.g. private mode) — keep in memory */
    }
  }

  // --- Profile ---
  async getProfile(): Promise<Profile> {
    return { ...this.db.profile };
  }
  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    this.db.profile = { ...this.db.profile, ...patch };
    this.persist();
    return { ...this.db.profile };
  }

  // --- Students ---
  async listStudents(): Promise<Student[]> {
    return [...this.db.students].sort((a, b) => a.name.localeCompare(b.name));
  }
  async getStudent(id: string): Promise<Student | null> {
    return this.db.students.find((s) => s.id === id) ?? null;
  }
  async createStudent(input: NewStudent): Promise<Student> {
    const student: Student = { ...input, id: uid(), createdAt: new Date().toISOString() };
    this.db.students.push(student);
    this.persist();
    return student;
  }
  async updateStudent(id: string, patch: Partial<NewStudent>): Promise<Student> {
    const s = this.mustFind(this.db.students, id);
    Object.assign(s, patch);
    this.persist();
    return { ...s };
  }
  async deleteStudent(id: string): Promise<void> {
    this.db.students = this.db.students.filter((s) => s.id !== id);
    this.db.lessons = this.db.lessons.filter((l) => l.studentId !== id);
    this.db.payments = this.db.payments.filter((p) => p.studentId !== id);
    this.db.promotions = this.db.promotions.filter((p) => p.studentId !== id);
    this.db.studentSkills = this.db.studentSkills.filter((ss) => ss.studentId !== id);
    this.persist();
  }

  // --- Lessons ---
  async listLessons(): Promise<Lesson[]> {
    return [...this.db.lessons];
  }
  async lessonsForStudent(studentId: string): Promise<Lesson[]> {
    return this.db.lessons.filter((l) => l.studentId === studentId);
  }
  async createLesson(input: NewLesson): Promise<Lesson> {
    const lesson: Lesson = { ...input, id: uid(), createdAt: new Date().toISOString() };
    this.db.lessons.push(lesson);
    this.persist();
    return lesson;
  }
  async updateLesson(id: string, patch: Partial<NewLesson>): Promise<Lesson> {
    const l = this.mustFind(this.db.lessons, id);
    Object.assign(l, patch);
    this.persist();
    return { ...l };
  }
  async deleteLesson(id: string): Promise<void> {
    this.db.lessons = this.db.lessons.filter((l) => l.id !== id);
    this.persist();
  }

  // --- Payments ---
  async listPayments(): Promise<Payment[]> {
    return [...this.db.payments];
  }
  async paymentsForStudent(studentId: string): Promise<Payment[]> {
    return this.db.payments.filter((p) => p.studentId === studentId);
  }
  async createPayment(input: NewPayment): Promise<Payment> {
    const payment: Payment = { ...input, id: uid(), createdAt: new Date().toISOString() };
    this.db.payments.push(payment);
    this.persist();
    return payment;
  }
  async updatePayment(id: string, patch: Partial<NewPayment>): Promise<Payment> {
    const p = this.mustFind(this.db.payments, id);
    Object.assign(p, patch);
    this.persist();
    return { ...p };
  }
  async deletePayment(id: string): Promise<void> {
    this.db.payments = this.db.payments.filter((p) => p.id !== id);
    this.persist();
  }

  // --- Promotions ---
  async promotionsForStudent(studentId: string): Promise<Promotion[]> {
    return this.db.promotions
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => b.promotedOn.localeCompare(a.promotedOn));
  }
  async createPromotion(input: NewPromotion): Promise<Promotion> {
    const promo: Promotion = { ...input, id: uid() };
    this.db.promotions.push(promo);
    this.persist();
    return promo;
  }
  async deletePromotion(id: string): Promise<void> {
    this.db.promotions = this.db.promotions.filter((p) => p.id !== id);
    this.persist();
  }

  // --- Skills ---
  async listSkills(): Promise<Skill[]> {
    return [...this.db.skills].sort((a, b) => a.sort - b.sort);
  }
  async studentSkills(studentId: string): Promise<StudentSkill[]> {
    return this.db.studentSkills.filter((ss) => ss.studentId === studentId);
  }
  async setStudentSkill(
    studentId: string,
    skillId: string,
    status: SkillStatus,
  ): Promise<StudentSkill> {
    let ss = this.db.studentSkills.find(
      (x) => x.studentId === studentId && x.skillId === skillId,
    );
    if (ss) {
      ss.status = status;
      ss.updatedAt = new Date().toISOString();
    } else {
      ss = { id: uid(), studentId, skillId, status, updatedAt: new Date().toISOString() };
      this.db.studentSkills.push(ss);
    }
    this.persist();
    return { ...ss };
  }

  async resetDemo(): Promise<void> {
    this.db = buildSampleData();
    this.persist();
  }

  private mustFind<T extends { id: string }>(list: T[], id: string): T {
    const item = list.find((x) => x.id === id);
    if (!item) throw new Error(`Record not found: ${id}`);
    return item;
  }
}
