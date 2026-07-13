import { Link } from "react-router-dom";
import type { Lesson, Payment } from "../data/types";
import { formatDate, formatDuration, formatTime } from "../lib/dates";
import { formatMoney } from "../lib/money";
import { StatusBadge } from "./ui";

const PAYMENT_LABEL: Record<Payment["method"], string> = {
  cash: "Cash",
  venmo: "Venmo",
  zelle: "Zelle",
  other: "Other",
};

export function LessonRow({
  lesson,
  studentName,
  to,
}: {
  lesson: Lesson;
  studentName?: string;
  to: string;
}) {
  const techniques = lesson.techniques
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
  const meta = techniques.length
    ? techniques.join(" · ")
    : lesson.location || "";
  return (
    <Link className="list-row" to={to}>
      <div className="lesson-time">
        <div className="lesson-time__t">{formatTime(lesson.startsAt)}</div>
        <div className="lesson-time__d">
          {formatDuration(lesson.durationMinutes)}
        </div>
      </div>
      <div className={`lesson-bar lesson-bar--${lesson.status}`} />
      <div className="list-row__grow">
        {studentName && <div className="list-row__title">{studentName}</div>}
        {meta && <div className="list-row__meta truncate">{meta}</div>}
      </div>
      <StatusBadge status={lesson.status} />
    </Link>
  );
}

export function PaymentRow({
  payment,
  studentName,
  to,
}: {
  payment: Payment;
  studentName?: string;
  to: string;
}) {
  const meta = [
    formatDate(payment.paidOn),
    PAYMENT_LABEL[payment.method],
    payment.lessonsCovered > 0
      ? `${payment.lessonsCovered} lesson${payment.lessonsCovered === 1 ? "" : "s"}`
      : "",
    payment.note,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link className="list-row" to={to}>
      <div className="list-row__grow">
        {studentName && <div className="list-row__title">{studentName}</div>}
        <div className="list-row__meta truncate">{meta}</div>
      </div>
      <div style={{ fontWeight: 700, color: "var(--accent-deep)" }}>
        {formatMoney(payment.amountCents)}
      </div>
    </Link>
  );
}
