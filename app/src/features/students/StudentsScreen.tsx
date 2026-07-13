import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, BeltBadge, Card, EmptyState, LinkButton } from "../../components/ui";
import { store } from "../../data";
import { useData } from "../../lib/useData";
import { relativeDay } from "../../lib/dates";
import { upcomingLessons } from "../../lib/billing";
import type { Student } from "../../data/types";

export function StudentsScreen() {
  const [query, setQuery] = useState("");
  const { data } = useData(async () => {
    const [students, lessons] = await Promise.all([
      store.listStudents(),
      store.listLessons(),
    ]);
    return { students, lessons };
  });

  const groups = useMemo(() => {
    if (!data) return null;
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.students.filter((s) => s.name.toLowerCase().includes(q))
      : data.students;
    const nextByStudent = new Map<string, string>();
    for (const s of filtered) {
      const next = upcomingLessons(
        data.lessons.filter((l) => l.studentId === s.id),
      )[0];
      if (next) nextByStudent.set(s.id, relativeDay(next.startsAt));
    }
    return {
      active: filtered.filter((s) => s.isActive),
      inactive: filtered.filter((s) => !s.isActive),
      nextByStudent,
    };
  }, [data, query]);

  const renderRow = (s: Student) => (
    <Link key={s.id} className="list-row" to={`/students/${s.id}`}>
      <Avatar name={s.name} belt={s.belt} />
      <div className="list-row__grow">
        <div className="list-row__title">{s.name}</div>
        <div style={{ marginTop: 4 }}>
          <BeltBadge belt={s.belt} stripes={s.stripes} />
        </div>
      </div>
      {groups?.nextByStudent.get(s.id) && (
        <div className="list-row__trail">
          <div className="muted" style={{ fontSize: "0.68rem" }}>
            Next
          </div>
          {groups.nextByStudent.get(s.id)}
        </div>
      )}
    </Link>
  );

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="title-group">
          <div className="screen-eyebrow">Roster</div>
          <h1 className="screen-title">Students</h1>
        </div>
        <LinkButton to="/students/new" variant="primary" size="sm">
          + Student
        </LinkButton>
      </header>

      {data && data.students.length === 0 ? (
        <EmptyState
          title="No students yet"
          message="Add your first private student to start tracking lessons and progress."
          action={
            <LinkButton to="/students/new" variant="primary">
              Add student
            </LinkButton>
          }
        />
      ) : (
        <>
          <div className="field" style={{ marginBottom: "var(--s-4)" }}>
            <input
              type="search"
              placeholder="Search students"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {groups && groups.active.length > 0 && (
            <>
              <div className="section-label">Active</div>
              <Card>
                <ul className="list">{groups.active.map(renderRow)}</ul>
              </Card>
            </>
          )}
          {groups && groups.inactive.length > 0 && (
            <>
              <div className="section-label">Inactive</div>
              <Card>
                <ul className="list">{groups.inactive.map(renderRow)}</ul>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
