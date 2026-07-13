import { useMemo, useState } from "react";
import { Card, EmptyState, LinkButton } from "../../components/ui";
import { LessonRow } from "../../components/rows";
import { store } from "../../data";
import { useData } from "../../lib/useData";
import { formatDayFull, relativeDay, startOfDay } from "../../lib/dates";
import type { Lesson } from "../../data/types";

type Scope = "upcoming" | "past";

export function ScheduleScreen() {
  const [scope, setScope] = useState<Scope>("upcoming");
  const { data } = useData(async () => {
    const [lessons, students] = await Promise.all([
      store.listLessons(),
      store.listStudents(),
    ]);
    return { lessons, students };
  });

  const groups = useMemo(() => {
    if (!data) return [];
    const from = startOfDay(new Date()).getTime();
    const nameById = new Map(data.students.map((s) => [s.id, s.name]));
    const filtered = data.lessons.filter((l) =>
      scope === "upcoming"
        ? new Date(l.startsAt).getTime() >= from
        : new Date(l.startsAt).getTime() < from,
    );
    const byDay = new Map<number, Lesson[]>();
    for (const l of filtered) {
      const key = startOfDay(l.startsAt).getTime();
      const arr = byDay.get(key) ?? [];
      arr.push(l);
      byDay.set(key, arr);
    }
    const keys = [...byDay.keys()].sort((a, b) => (scope === "upcoming" ? a - b : b - a));
    return keys.map((k) => ({
      key: k,
      lessons: byDay.get(k)!.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
      nameById,
    }));
  }, [data, scope]);

  function header(key: number): string {
    const rel = relativeDay(new Date(key));
    const full = formatDayFull(new Date(key));
    return ["Today", "Tomorrow", "Yesterday"].includes(rel) ? `${rel} · ${full}` : full;
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="title-group">
          <div className="screen-eyebrow">Calendar</div>
          <h1 className="screen-title">Schedule</h1>
        </div>
        <LinkButton to="/lessons/new" variant="primary" size="sm">
          + Lesson
        </LinkButton>
      </header>

      <div className="center" style={{ marginBottom: "var(--s-4)" }}>
        <div className="segment">
          <button className={scope === "upcoming" ? "is-active" : ""} onClick={() => setScope("upcoming")}>
            Upcoming
          </button>
          <button className={scope === "past" ? "is-active" : ""} onClick={() => setScope("past")}>
            Past
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title={scope === "upcoming" ? "Nothing scheduled" : "No past lessons"}
          message={
            scope === "upcoming"
              ? "Add a lesson with the + button."
              : "Completed and past lessons will appear here."
          }
        />
      ) : (
        groups.map((g) => (
          <div key={g.key}>
            <div className="section-label">{header(g.key)}</div>
            <Card>
              <ul className="list">
                {g.lessons.map((l) => (
                  <LessonRow
                    key={l.id}
                    lesson={l}
                    studentName={g.nameById.get(l.studentId) ?? "—"}
                    to={`/lessons/${l.id}`}
                  />
                ))}
              </ul>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
