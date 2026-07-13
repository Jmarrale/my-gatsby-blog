import { useMemo } from "react";
import { LinkButton, Card, EmptyState } from "../../components/ui";
import { LessonRow } from "../../components/rows";
import { store } from "../../data";
import { useData } from "../../lib/useData";
import { dayDiff, formatDayFull, isToday } from "../../lib/dates";
import { revenueThisMonth } from "../../lib/billing";
import { formatMoney } from "../../lib/money";

export function DashboardScreen() {
  const { data } = useData(async () => {
    const [profile, students, lessons, payments] = await Promise.all([
      store.getProfile(),
      store.listStudents(),
      store.listLessons(),
      store.listPayments(),
    ]);
    return { profile, students, lessons, payments };
  });

  const view = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const nameById = new Map(data.students.map((s) => [s.id, s.name]));
    const today = data.lessons
      .filter((l) => isToday(l.startsAt, now))
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    const week = data.lessons.filter((l) => {
      const d = dayDiff(l.startsAt, now);
      return d >= 0 && d < 7;
    }).length;
    const activeCount = data.students.filter((s) => s.isActive).length;
    const revenue = revenueThisMonth(data.payments, now);
    return { today, week, activeCount, revenue, nameById };
  }, [data]);

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="title-group">
          <div className="screen-eyebrow">{formatDayFull(new Date())}</div>
          <h1 className="screen-title">Today</h1>
        </div>
        <LinkButton to="/lessons/new" variant="primary" size="sm">
          + Lesson
        </LinkButton>
      </header>

      {view && (
        <>
          <div className="tiles tiles--4">
            <div className="tile">
              <div className="tile__value">{view.today.length}</div>
              <div className="tile__label">Today</div>
            </div>
            <div className="tile">
              <div className="tile__value">{view.week}</div>
              <div className="tile__label">This week</div>
            </div>
            <div className="tile">
              <div className="tile__value">{view.activeCount}</div>
              <div className="tile__label">Active students</div>
            </div>
            <div className="tile tile--warm">
              <div className="tile__value">{formatMoney(view.revenue)}</div>
              <div className="tile__label">Revenue (mo.)</div>
            </div>
          </div>

          <div className="section-label">Today's lessons</div>
          {view.today.length === 0 ? (
            <Card className="card--pad muted">No lessons scheduled today.</Card>
          ) : (
            <Card>
              <ul className="list">
                {view.today.map((l) => (
                  <LessonRow
                    key={l.id}
                    lesson={l}
                    studentName={view.nameById.get(l.studentId) ?? "—"}
                    to={`/lessons/${l.id}`}
                  />
                ))}
              </ul>
            </Card>
          )}

          {view.today.length === 0 && view.week === 0 && (
            <EmptyState
              title="A calm week"
              message="Nothing on the schedule yet. Add a lesson to get started."
              action={
                <LinkButton to="/lessons/new" variant="primary">
                  Schedule a lesson
                </LinkButton>
              }
            />
          )}
        </>
      )}
    </div>
  );
}
