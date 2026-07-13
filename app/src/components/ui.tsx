import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Belt, LessonStatus } from "../data/types";
import { initialsOf } from "../lib/billing";

const BELT_CLASS: Record<Belt, string> = {
  White: "belt--white",
  Blue: "belt--blue",
  Purple: "belt--purple",
  Brown: "belt--brown",
  Black: "belt--black",
};

const STATUS_LABEL: Record<LessonStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export function Button({
  variant = "default",
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${className}`}
      {...rest}
    />
  );
}

export function LinkButton({
  to,
  variant = "default",
  size = "md",
  children,
}: {
  to: string;
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md";
  children: ReactNode;
}) {
  return (
    <Link className={`btn btn--${variant} btn--${size}`} to={to}>
      {children}
    </Link>
  );
}

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function BeltBadge({ belt, stripes = 0 }: { belt: Belt; stripes?: number }) {
  return (
    <span className={`belt ${BELT_CLASS[belt]}`}>
      {belt}
      {stripes > 0 && (
        <span className="belt__stripes">
          {Array.from({ length: Math.min(stripes, 4) }).map((_, i) => (
            <span key={i} className="belt__dot" />
          ))}
        </span>
      )}
    </span>
  );
}

export function StatusBadge({ status }: { status: LessonStatus }) {
  return (
    <span className={`status status--${status}`}>{STATUS_LABEL[status]}</span>
  );
}

export function Avatar({
  name,
  belt,
  size = 44,
}: {
  name: string;
  belt: Belt;
  size?: number;
}) {
  return (
    <span
      className={`avatar ${BELT_CLASS[belt]}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initialsOf(name)}
    </span>
  );
}

export function StatTile({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: ReactNode;
  emphasis?: "warm" | "danger" | "muted";
}) {
  return (
    <div className={`tile ${emphasis ? `tile--${emphasis}` : ""}`}>
      <div className="tile__value">{value}</div>
      <div className="tile__label">{label}</div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p className="muted">{message}</p>
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}
