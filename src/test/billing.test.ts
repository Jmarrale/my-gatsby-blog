import { describe, expect, it } from "vitest";
import {
  amountOwed,
  amountPaid,
  balance,
  lessonsRemaining,
  rateFor,
  revenueThisMonth,
} from "../lib/billing";
import { dollarsToCents, formatMoney } from "../lib/money";
import type { Lesson, Payment, Profile, Student } from "../data/types";

const profile: Profile = {
  id: "p",
  businessName: "Studio",
  defaultRateCents: 5000,
  currency: "USD",
  timezone: "UTC",
};

const student = (over: Partial<Student> = {}): Student => ({
  id: "s1",
  name: "Test",
  belt: "White",
  stripes: 0,
  email: "",
  phone: "",
  startDate: "2024-01-01",
  notes: "",
  defaultRateCents: 8000,
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  ...over,
});

const lesson = (over: Partial<Lesson> = {}): Lesson => ({
  id: "l" + Math.random(),
  studentId: "s1",
  startsAt: "2024-05-01T17:00:00.000Z",
  durationMinutes: 60,
  status: "completed",
  techniques: "",
  notes: "",
  location: "",
  rateCents: null,
  createdAt: "2024-05-01T00:00:00.000Z",
  ...over,
});

const payment = (over: Partial<Payment> = {}): Payment => ({
  id: "pay" + Math.random(),
  studentId: "s1",
  paidOn: "2024-05-01",
  amountCents: 8000,
  method: "cash",
  lessonsCovered: 0,
  note: "",
  createdAt: "2024-05-01T00:00:00.000Z",
  ...over,
});

describe("rateFor fallback chain", () => {
  it("prefers the lesson's snapshot rate", () => {
    expect(rateFor(lesson({ rateCents: 12000 }), student(), profile)).toBe(12000);
  });
  it("falls back to the student's default rate", () => {
    expect(rateFor(lesson({ rateCents: null }), student({ defaultRateCents: 9000 }), profile)).toBe(9000);
  });
  it("falls back to the profile default when student rate is null", () => {
    expect(rateFor(lesson({ rateCents: null }), student({ defaultRateCents: null }), profile)).toBe(5000);
  });
  it("is zero when nothing is set", () => {
    expect(rateFor(lesson({ rateCents: null }), student({ defaultRateCents: null }), undefined)).toBe(0);
  });
});

describe("amountOwed", () => {
  it("counts only completed lessons", () => {
    const lessons = [
      lesson({ status: "completed", rateCents: 8000 }),
      lesson({ status: "scheduled", rateCents: 8000 }),
      lesson({ status: "cancelled", rateCents: 8000 }),
      lesson({ status: "no_show", rateCents: 8000 }),
      lesson({ status: "completed", rateCents: 8000 }),
    ];
    expect(amountOwed(lessons, student(), profile)).toBe(16000);
  });
});

describe("balance and payments", () => {
  it("is positive when the student owes money", () => {
    const lessons = [lesson({ rateCents: 8000 }), lesson({ rateCents: 8000 })];
    const payments = [payment({ amountCents: 8000 })];
    expect(amountPaid(payments)).toBe(8000);
    expect(balance(lessons, payments, student(), profile)).toBe(8000);
  });
  it("is negative (credit) when prepaid beyond lessons taken", () => {
    const lessons = [lesson({ rateCents: 8000 })];
    const payments = [payment({ amountCents: 80000, lessonsCovered: 10 })];
    expect(balance(lessons, payments, student(), profile)).toBe(-72000);
  });
});

describe("lessonsRemaining", () => {
  it("subtracts completed lessons from prepaid package credits", () => {
    const lessons = [
      lesson({ status: "completed" }),
      lesson({ status: "completed" }),
      lesson({ status: "scheduled" }),
    ];
    const payments = [payment({ lessonsCovered: 10 })];
    expect(lessonsRemaining(lessons, payments)).toBe(8);
  });
});

describe("revenueThisMonth", () => {
  it("sums only payments in the current month", () => {
    const now = new Date("2024-06-15T12:00:00.000Z");
    const payments = [
      payment({ paidOn: "2024-06-01", amountCents: 5000 }),
      payment({ paidOn: "2024-06-30", amountCents: 5000 }),
      payment({ paidOn: "2024-05-30", amountCents: 9999 }),
    ];
    expect(revenueThisMonth(payments, now)).toBe(10000);
  });
});

describe("money helpers", () => {
  it("parses dollars to integer cents without float drift", () => {
    expect(dollarsToCents("80")).toBe(8000);
    expect(dollarsToCents("80.5")).toBe(8050);
    expect(dollarsToCents("0.1")).toBe(10);
    expect(dollarsToCents("")).toBe(0);
  });
  it("formats cents as currency", () => {
    expect(formatMoney(8000)).toBe("$80.00");
    expect(formatMoney(0)).toBe("$0.00");
  });
});
