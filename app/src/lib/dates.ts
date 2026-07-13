// Date helpers. Kept pure and dependency-free for easy testing.

export function startOfDay(d: Date | string): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function dayDiff(a: Date | string, b: Date | string): number {
  return Math.round(
    (startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000,
  );
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return dayDiff(a, b) === 0;
}

export function isToday(d: Date | string, now: Date = new Date()): boolean {
  return dayDiff(d, now) === 0;
}

export function isSameMonth(
  a: Date | string,
  b: Date | string = new Date(),
): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear?.() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getFullYear() === db.getFullYear()
  );
}

export function relativeDay(d: Date | string, now: Date = new Date()): string {
  const diff = dayDiff(d, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return new Date(d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDayFull(d: Date | string): string {
  return new Date(d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** yyyy-mm-dd for <input type="date"> */
export function toDateInput(d: Date | string): string {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}

/** yyyy-mm-ddTHH:mm for <input type="datetime-local"> */
export function toDateTimeInput(d: Date | string): string {
  const x = new Date(d);
  return `${toDateInput(x)}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
