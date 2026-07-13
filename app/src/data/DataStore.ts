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

/** The full local dataset shape (also the JSON persisted to localStorage). */
export interface Database {
  profile: Profile;
  students: Student[];
  lessons: Lesson[];
  payments: Payment[];
  promotions: Promotion[];
  skills: Skill[];
  studentSkills: StudentSkill[];
}

/**
 * Storage-agnostic data contract. The UI depends ONLY on this interface —
 * never on localStorage or Supabase directly — so the backend can be swapped
 * by changing one factory (see data/index.ts).
 */
export interface DataStore {
  getProfile(): Promise<Profile>;
  updateProfile(patch: Partial<Profile>): Promise<Profile>;

  listStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | null>;
  createStudent(input: NewStudent): Promise<Student>;
  updateStudent(id: string, patch: Partial<NewStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  listLessons(): Promise<Lesson[]>;
  lessonsForStudent(studentId: string): Promise<Lesson[]>;
  createLesson(input: NewLesson): Promise<Lesson>;
  updateLesson(id: string, patch: Partial<NewLesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;

  listPayments(): Promise<Payment[]>;
  paymentsForStudent(studentId: string): Promise<Payment[]>;
  createPayment(input: NewPayment): Promise<Payment>;
  updatePayment(id: string, patch: Partial<NewPayment>): Promise<Payment>;
  deletePayment(id: string): Promise<void>;

  promotionsForStudent(studentId: string): Promise<Promotion[]>;
  createPromotion(input: NewPromotion): Promise<Promotion>;
  deletePromotion(id: string): Promise<void>;

  listSkills(): Promise<Skill[]>;
  studentSkills(studentId: string): Promise<StudentSkill[]>;
  setStudentSkill(
    studentId: string,
    skillId: string,
    status: SkillStatus,
  ): Promise<StudentSkill>;

  /** Optional: only local mode supports resetting to sample data. */
  resetDemo?(): Promise<void>;
}
