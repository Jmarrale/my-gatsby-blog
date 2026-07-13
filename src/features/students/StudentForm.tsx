import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Field } from "../../components/ui";
import { store } from "../../data";
import { BELTS, type Belt } from "../../data/types";
import { centsToDollars, dollarsToCents } from "../../lib/money";
import { toDateInput } from "../../lib/dates";

export function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [loaded, setLoaded] = useState(!editing);
  const [name, setName] = useState("");
  const [belt, setBelt] = useState<Belt>("White");
  const [stripes, setStripes] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(toDateInput(new Date()));
  const [rate, setRate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!editing || !id) return;
    store.getStudent(id).then((s) => {
      if (!s) return;
      setName(s.name);
      setBelt(s.belt);
      setStripes(s.stripes);
      setEmail(s.email);
      setPhone(s.phone);
      setStartDate(s.startDate ? toDateInput(s.startDate) : toDateInput(new Date()));
      setRate(s.defaultRateCents != null ? String(centsToDollars(s.defaultRateCents)) : "");
      setIsActive(s.isActive);
      setNotes(s.notes);
      setLoaded(true);
    });
  }, [editing, id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      belt,
      stripes,
      email: email.trim(),
      phone: phone.trim(),
      startDate,
      notes,
      defaultRateCents: rate === "" ? null : dollarsToCents(rate),
      isActive,
    };
    if (editing && id) await store.updateStudent(id, payload);
    else await store.createStudent(payload);
    navigate(-1);
  }

  if (!loaded) return <div className="screen muted" style={{ paddingTop: 40 }}>Loading…</div>;

  return (
    <div className="screen">
      <header className="screen-header">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <div className="spacer" />
        <h1 className="screen-title" style={{ fontSize: "var(--step-1)" }}>
          {editing ? "Edit student" : "New student"}
        </h1>
      </header>

      <Card className="card--pad">
        <form onSubmit={submit}>
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} required autoCapitalize="words" />
          </Field>
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
          <Field label="Training since">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <div className="field-grid">
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </div>
          <Field label="Default lesson rate" hint="Dollars per lesson, e.g. 80">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </Field>
          <div className="field toggle">
            <span className="field__label" style={{ margin: 0 }}>Active student</span>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </div>
          <Field label="Notes" hint="Goals, injuries, preferences…">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </Field>
          <Button type="submit" variant="primary" disabled={!name.trim()} style={{ width: "100%" }}>
            {editing ? "Save changes" : "Add student"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
