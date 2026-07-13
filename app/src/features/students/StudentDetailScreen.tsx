import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  BeltBadge,
  Button,
  Card,
  Field,
  LinkButton,
  StatTile,
} from "../../components/ui";
import { LessonRow, PaymentRow } from "../../components/rows";
import { store } from "../../data";
import { useData } from "../../lib/useData";
import { formatDate } from "../../lib/dates";
import {
  amountOwed,
  amountPaid,
  balance,
  completedLessons,
  lessonsRemaining,
  upcomingLessons,
} from "../../lib/billing";
import { formatMoney } from "../../lib/money";
import { BELTS, SKILL_STATUSES, type Belt, type SkillStatus } from "../../data/types";

type Tab = "overview" | "progress" | "lessons" | "billing";
const SKILL_LABEL: Record<SkillStatus, string> = {
  not_started: "Not started",
  drilling: "Drilling",
  proficient: "Proficient",
};
const nextSkillStatus = (s: SkillStatus): SkillStatus =>
  SKILL_STATUSES[(SKILL_STATUSES.indexOf(s) + 1) % SKILL_STATUSES.length];

export function StudentDetailScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  const { data, reload } = useData(async () => {
    const [student, profile, lessons, payments, promotions, skills, studentSkills] =
      await Promise.all([
        store.getStudent(id),
        store.getProfile(),
        store.lessonsForStudent(id),
        store.paymentsForStudent(id),
        store.promotionsForStudent(id),
        store.listSkills(),
        store.studentSkills(id),
      ]);
    return { student, profile, lessons, payments, promotions, skills, studentSkills };
  }, [id]);

  const derived = useMemo(() => {
    if (!data?.student) return null;
    const { student, profile, lessons, payments } = data;
    return {
      completed: completedLessons(lessons).length,
      remaining: lessonsRemaining(lessons, payments),
      owed: amountOwed(lessons, student, profile),
      paid: amountPaid(payments),
      bal: balance(lessons, payments, student, profile),
      upcoming: upcomingLessons(lessons),
      recent: [...lessons].sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt)),
    };
  }, [data]);

  if (!data) return <div className="screen muted" style={{ paddingTop: 40 }}>Loading…</div>;
  if (!data.student) {
    return (
      <div className="screen" style={{ paddingTop: 40 }}>
        <p className="muted">Student not found.</p>
        <LinkButton to="/students">Back to students</LinkButton>
      </div>
    );
  }
  const s = data.student;

  async function remove() {
    if (confirm(`Delete ${s.name} and all their lessons and payments?`)) {
      await store.deleteStudent(s.id);
      navigate("/students");
    }
  }

  const statusById = new Map(data.studentSkills.map((ss) => [ss.skillId, ss.status]));

  return (
    <div className="screen">
      <header className="screen-header">
        <Link to="/students" className="btn btn--ghost btn--sm">‹ Students</Link>
        <div className="spacer" />
        <LinkButton to={`/students/${s.id}/edit`} variant="ghost" size="sm">
          Edit
        </LinkButton>
      </header>

      <Card className="card--pad">
        <div className="detail-head">
          <Avatar name={s.name} belt={s.belt} size={64} />
          <div>
            <div className="detail-head__name">{s.name}</div>
            <div style={{ marginTop: 6 }}>
              <BeltBadge belt={s.belt} stripes={s.stripes} />
            </div>
            <div className="detail-head__since">
              Training since {formatDate(s.startDate)}
            </div>
          </div>
        </div>
        {(s.phone || s.email) && (
          <div className="row" style={{ gap: "var(--s-6)", marginTop: "var(--s-4)" }}>
            {s.phone && <a href={`tel:${s.phone}`}>Call</a>}
            {s.email && <a href={`mailto:${s.email}`}>Email</a>}
          </div>
        )}
      </Card>

      <div className="tabs">
        {(["overview", "progress", "lessons", "billing"] as Tab[]).map((t) => (
          <button
            key={t}
            className={tab === t ? "is-active" : ""}
            onClick={() => setTab(t)}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && derived && (
        <>
          <div className="tiles tiles--3">
            <StatTile label="Completed" value={derived.completed} />
            <StatTile
              label="Prepaid left"
              value={derived.remaining}
              emphasis={derived.remaining < 0 ? "danger" : undefined}
            />
            <StatTile
              label="Balance"
              value={formatMoney(derived.bal)}
              emphasis={derived.bal > 0 ? "danger" : "muted"}
            />
          </div>
          {derived.upcoming.length > 0 && (
            <>
              <div className="section-label">Upcoming</div>
              <Card>
                <ul className="list">
                  {derived.upcoming.map((l) => (
                    <LessonRow key={l.id} lesson={l} to={`/lessons/${l.id}`} />
                  ))}
                </ul>
              </Card>
            </>
          )}
          {s.notes && (
            <>
              <div className="section-label">Notes</div>
              <Card className="card--pad" >
                <p style={{ whiteSpace: "pre-wrap" }}>{s.notes}</p>
              </Card>
            </>
          )}
        </>
      )}

      {tab === "progress" && (
        <ProgressTab
          studentBelt={s.belt}
          studentStripes={s.stripes}
          promotions={data.promotions}
          skills={data.skills}
          statusById={statusById}
          onAddPromotion={async (belt, stripes, note) => {
            await store.createPromotion({
              studentId: s.id,
              promotedOn: new Date().toISOString().slice(0, 10),
              belt,
              stripes,
              note,
            });
            reload();
          }}
          onCycleSkill={async (skillId, current) => {
            await store.setStudentSkill(s.id, skillId, nextSkillStatus(current ?? "not_started"));
            reload();
          }}
        />
      )}

      {tab === "lessons" && derived && (
        <>
          <div className="row" style={{ justifyContent: "flex-end", marginTop: "var(--s-4)" }}>
            <LinkButton to={`/lessons/new?student=${s.id}`} variant="primary" size="sm">
              + Log lesson
            </LinkButton>
          </div>
          {derived.recent.length === 0 ? (
            <Card className="card--pad muted" >No lessons yet.</Card>
          ) : (
            <Card>
              <ul className="list">
                {derived.recent.map((l) => (
                  <LessonRow key={l.id} lesson={l} to={`/lessons/${l.id}`} />
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {tab === "billing" && derived && (
        <>
          <div className="tiles tiles--3" style={{ marginTop: "var(--s-4)" }}>
            <StatTile label="Charged" value={formatMoney(derived.owed)} />
            <StatTile label="Paid" value={formatMoney(derived.paid)} />
            <StatTile
              label="Balance"
              value={formatMoney(derived.bal)}
              emphasis={derived.bal > 0 ? "danger" : "muted"}
            />
          </div>
          <div className="row" style={{ gap: "var(--s-2)", marginTop: "var(--s-4)" }}>
            <LinkButton to={`/payments/new?student=${s.id}`} variant="primary" size="sm">
              + Payment
            </LinkButton>
            <LinkButton to={`/students/${s.id}/statement`} variant="default" size="sm">
              View statement
            </LinkButton>
          </div>
          {data.payments.length === 0 ? (
            <Card className="card--pad muted" style={{ marginTop: "var(--s-3)" }}>
              No payments recorded.
            </Card>
          ) : (
            <Card style={{ marginTop: "var(--s-3)" }}>
              <ul className="list">
                {[...data.payments]
                  .sort((a, b) => b.paidOn.localeCompare(a.paidOn))
                  .map((p) => (
                    <PaymentRow key={p.id} payment={p} to={`/payments/${p.id}`} />
                  ))}
              </ul>
            </Card>
          )}
        </>
      )}

      <div style={{ marginTop: "var(--s-8)" }}>
        <Button variant="danger" onClick={remove}>
          Delete student
        </Button>
      </div>
    </div>
  );
}

function ProgressTab({
  studentBelt,
  studentStripes,
  promotions,
  skills,
  statusById,
  onAddPromotion,
  onCycleSkill,
}: {
  studentBelt: Belt;
  studentStripes: number;
  promotions: import("../../data/types").Promotion[];
  skills: import("../../data/types").Skill[];
  statusById: Map<string, SkillStatus>;
  onAddPromotion: (belt: Belt, stripes: number, note: string) => void;
  onCycleSkill: (skillId: string, current: SkillStatus | undefined) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [belt, setBelt] = useState<Belt>(studentBelt);
  const [stripes, setStripes] = useState(studentStripes);
  const [note, setNote] = useState("");

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginTop: "var(--s-4)" }}>
        <div className="section-label" style={{ margin: 0 }}>Belt history</div>
        <Button size="sm" onClick={() => setAdding((a) => !a)}>
          {adding ? "Cancel" : "+ Promotion"}
        </Button>
      </div>
      {adding && (
        <Card className="card--pad" style={{ marginTop: "var(--s-3)" }}>
          <div className="field-grid">
            <Field label="Belt">
              <select value={belt} onChange={(e) => setBelt(e.target.value as Belt)}>
                {BELTS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field label="Stripes">
              <select value={stripes} onChange={(e) => setStripes(Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Note">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Promoted to blue belt" />
          </Field>
          <Button
            variant="primary"
            onClick={() => {
              onAddPromotion(belt, stripes, note);
              setAdding(false);
              setNote("");
            }}
          >
            Save promotion
          </Button>
        </Card>
      )}
      {promotions.length === 0 ? (
        <Card className="card--pad muted" style={{ marginTop: "var(--s-3)" }}>
          No promotions recorded yet.
        </Card>
      ) : (
        <Card style={{ marginTop: "var(--s-3)" }}>
          <ul className="timeline">
            {promotions.map((p) => (
              <li key={p.id}>
                <BeltBadge belt={p.belt} stripes={p.stripes} />
                <div className="list-row__grow">
                  {p.note && <div className="list-row__title">{p.note}</div>}
                  <div className="list-row__meta">{formatDate(p.promotedOn)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="section-label">Skills checklist</div>
      <Card>
        <ul className="list">
          {skills.map((sk) => {
            const status = statusById.get(sk.id) ?? "not_started";
            return (
              <li key={sk.id} className="skill-row">
                <div className="list-row__grow">
                  <div className="list-row__title">{sk.name}</div>
                  <div className="list-row__meta">{sk.category}</div>
                </div>
                <button
                  className={
                    status === "proficient"
                      ? "status status--completed"
                      : status === "drilling"
                        ? "status status--scheduled"
                        : "chip"
                  }
                  style={{ border: "none", cursor: "pointer" }}
                  onClick={() => onCycleSkill(sk.id, statusById.get(sk.id))}
                >
                  {SKILL_LABEL[status]}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
