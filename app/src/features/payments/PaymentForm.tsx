import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, Field } from "../../components/ui";
import { store } from "../../data";
import { PAYMENT_METHODS, type PaymentMethod, type Student } from "../../data/types";
import { centsToDollars, dollarsToCents } from "../../lib/money";
import { toDateInput } from "../../lib/dates";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  venmo: "Venmo",
  zelle: "Zelle",
  other: "Other",
};

export function PaymentForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [students, setStudents] = useState<Student[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [studentId, setStudentId] = useState(params.get("student") ?? "");
  const [paidOn, setPaidOn] = useState(toDateInput(new Date()));
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [lessonsCovered, setLessonsCovered] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      const list = await store.listStudents();
      setStudents(list);
      if (editing && id) {
        const all = await store.listPayments();
        const p = all.find((x) => x.id === id);
        if (p) {
          setStudentId(p.studentId);
          setPaidOn(toDateInput(p.paidOn));
          setAmount(String(centsToDollars(p.amountCents)));
          setMethod(p.method);
          setLessonsCovered(p.lessonsCovered);
          setNote(p.note);
        }
      } else if (!studentId && list[0]) {
        setStudentId(list[0].id);
      }
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      studentId,
      paidOn,
      amountCents: dollarsToCents(amount),
      method,
      lessonsCovered,
      note: note.trim(),
    };
    if (payload.amountCents <= 0) return;
    if (editing && id) await store.updatePayment(id, payload);
    else await store.createPayment(payload);
    navigate(-1);
  }

  async function remove() {
    if (id && confirm("Delete this payment?")) {
      await store.deletePayment(id);
      navigate(-1);
    }
  }

  if (!loaded) return <div className="screen muted" style={{ paddingTop: 40 }}>Loading…</div>;
  if (students.length === 0) {
    return (
      <div className="screen" style={{ paddingTop: 40 }}>
        <p className="muted">Add a student first, then record a payment.</p>
      </div>
    );
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>Cancel</button>
        <div className="spacer" />
        <h1 className="screen-title" style={{ fontSize: "var(--step-1)" }}>
          {editing ? "Edit payment" : "Record payment"}
        </h1>
      </header>

      <Card className="card--pad">
        <form onSubmit={submit}>
          <Field label="Student">
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <div className="field-grid">
            <Field label="Amount" hint="Dollars">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Field>
            <Field label="Date">
              <input type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
            </Field>
          </div>
          <div className="field-grid">
            <Field label="Method">
              <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{METHOD_LABEL[m]}</option>
                ))}
              </select>
            </Field>
            <Field label="Lessons covered" hint="For prepaid packages">
              <input
                type="number"
                min="0"
                max="100"
                value={lessonsCovered}
                onChange={(e) => setLessonsCovered(Number(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Note">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 10-lesson package" />
          </Field>
          <Button type="submit" variant="primary" disabled={!amount} style={{ width: "100%" }}>
            {editing ? "Save changes" : "Record payment"}
          </Button>
          {editing && (
            <div style={{ marginTop: "var(--s-3)", textAlign: "center" }}>
              <Button type="button" variant="danger" onClick={remove}>Delete payment</Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
