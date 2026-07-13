import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, Field } from "../../components/ui";
import { store } from "../../data";
import { LESSON_STATUSES, type LessonStatus, type Student } from "../../data/types";
import { centsToDollars, dollarsToCents } from "../../lib/money";
import { toDateTimeInput } from "../../lib/dates";

const STATUS_LABEL: Record<LessonStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};
const DURATIONS = [30, 45, 60, 75, 90, 120];

export function LessonForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [students, setStudents] = useState<Student[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [studentId, setStudentId] = useState(params.get("student") ?? "");
  const [startsAt, setStartsAt] = useState(toDateTimeInput(new Date()));
  const [duration, setDuration] = useState(60);
  const [status, setStatus] = useState<LessonStatus>("scheduled");
  const [location, setLocation] = useState("");
  const [techniques, setTechniques] = useState("");
  const [notes, setNotes] = useState("");
  const [rate, setRate] = useState("");

  useEffect(() => {
    (async () => {
      const list = await store.listStudents();
      setStudents(list);
      if (editing && id) {
        const all = await store.listLessons();
        const l = all.find((x) => x.id === id);
        if (l) {
          setStudentId(l.studentId);
          setStartsAt(toDateTimeInput(l.startsAt));
          setDuration(l.durationMinutes);
          setStatus(l.status);
          setLocation(l.location);
          setTechniques(l.techniques);
          setNotes(l.notes);
          setRate(l.rateCents != null ? String(centsToDollars(l.rateCents)) : "");
        }
      } else if (!studentId && list[0]) {
        setStudentId(list[0].id);
        if (list[0].defaultRateCents != null) setRate(String(centsToDollars(list[0].defaultRateCents)));
      }
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, id]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === studentId),
    [students, studentId],
  );

  function onStudentChange(nextId: string) {
    setStudentId(nextId);
    if (rate === "") {
      const st = students.find((s) => s.id === nextId);
      if (st?.defaultRateCents != null) setRate(String(centsToDollars(st.defaultRateCents)));
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      studentId,
      startsAt: new Date(startsAt).toISOString(),
      durationMinutes: duration,
      status,
      location: location.trim(),
      techniques,
      notes,
      rateCents: rate === "" ? null : dollarsToCents(rate),
    };
    if (editing && id) await store.updateLesson(id, payload);
    else await store.createLesson(payload);
    navigate(-1);
  }

  async function remove() {
    if (id && confirm("Delete this lesson?")) {
      await store.deleteLesson(id);
      navigate(-1);
    }
  }

  if (!loaded) return <div className="screen muted" style={{ paddingTop: 40 }}>Loading…</div>;
  if (students.length === 0) {
    return (
      <div className="screen" style={{ paddingTop: 40 }}>
        <p className="muted">Add a student first, then schedule a lesson.</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>Cancel</button>
        <div className="spacer" />
        <h1 className="screen-title" style={{ fontSize: "var(--step-1)" }}>
          {editing ? "Edit lesson" : "New lesson"}
        </h1>
      </header>

      <Card className="card--pad">
        <form onSubmit={submit}>
          <Field label="Student">
            <select value={studentId} onChange={(e) => onStudentChange(e.target.value)} required>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Date & time">
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
          </Field>
          <div className="field-grid">
            <Field label="Duration">
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as LessonStatus)}>
                {LESSON_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Location">
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main mat" />
          </Field>
          <Field label="Techniques" hint="Comma-separated">
            <textarea value={techniques} onChange={(e) => setTechniques(e.target.value)} rows={2} />
          </Field>
          <Field label="Rate" hint={selectedStudent?.defaultRateCents != null ? "Leave blank to use the student's default" : "Dollars"}>
            <input type="number" inputMode="decimal" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
          </Field>
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </Field>
          <Button type="submit" variant="primary" style={{ width: "100%" }}>
            {editing ? "Save changes" : "Add lesson"}
          </Button>
          {editing && (
            <div style={{ marginTop: "var(--s-3)", textAlign: "center" }}>
              <Button type="button" variant="danger" onClick={remove}>Delete lesson</Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
