import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "../../components/ui";
import { store } from "../../data";
import { useData } from "../../lib/useData";
import { formatDate } from "../../lib/dates";
import {
  amountOwed,
  amountPaid,
  balance,
  completedLessons,
  rateFor,
} from "../../lib/billing";
import { formatMoney } from "../../lib/money";

export function StatementScreen() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const { data } = useData(async () => {
    const [student, profile, lessons, payments] = await Promise.all([
      store.getStudent(id),
      store.getProfile(),
      store.lessonsForStudent(id),
      store.paymentsForStudent(id),
    ]);
    return { student, profile, lessons, payments };
  }, [id]);

  if (!data) return <div className="screen muted" style={{ paddingTop: 40 }}>Loading…</div>;
  if (!data.student) {
    return <div className="screen" style={{ paddingTop: 40 }}>Student not found.</div>;
  }

  const { student, profile, lessons, payments } = data;
  const completed = completedLessons(lessons).sort(
    (a, b) => +new Date(a.startsAt) - +new Date(b.startsAt),
  );
  const owed = amountOwed(lessons, student, profile);
  const paid = amountPaid(payments);
  const bal = balance(lessons, payments, student, profile);
  const sortedPayments = [...payments].sort((a, b) => a.paidOn.localeCompare(b.paidOn));

  return (
    <div className="screen">
      <header className="screen-header no-print">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>‹ Back</button>
        <div className="spacer" />
        <Button variant="primary" size="sm" onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      </header>

      <Card className="card--pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="brandmark" style={{ fontSize: "var(--step-2)" }}>
              {profile.businessName}
            </div>
            <div className="muted" style={{ fontSize: "var(--step--1)" }}>
              Statement · {formatDate(new Date())}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>{student.name}</div>
            <div className="muted" style={{ fontSize: "var(--step--1)" }}>
              {student.email}
            </div>
          </div>
        </div>

        <div className="section-label">Lessons</div>
        {completed.length === 0 ? (
          <p className="muted">No completed lessons in this statement.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--step--1)" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: "6px 0" }}>Date</th>
                <th>Focus</th>
                <th style={{ textAlign: "right" }}>Charge</th>
              </tr>
            </thead>
            <tbody>
              {completed.map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 0" }}>{formatDate(l.startsAt)}</td>
                  <td className="truncate" style={{ maxWidth: 220 }}>{l.techniques || "Private lesson"}</td>
                  <td style={{ textAlign: "right" }}>{formatMoney(rateFor(l, student, profile))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="section-label">Payments</div>
        {sortedPayments.length === 0 ? (
          <p className="muted">No payments recorded.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--step--1)" }}>
            <tbody>
              {sortedPayments.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 0" }}>{formatDate(p.paidOn)}</td>
                  <td style={{ textTransform: "capitalize" }}>{p.method}</td>
                  <td style={{ textAlign: "right", color: "var(--accent-deep)" }}>
                    {formatMoney(p.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: "var(--s-6)", borderTop: "2px solid var(--border-strong)", paddingTop: "var(--s-4)" }}>
          <SummaryLine label="Total charged" value={formatMoney(owed)} />
          <SummaryLine label="Total paid" value={formatMoney(paid)} />
          <SummaryLine
            label={bal > 0 ? "Balance due" : "Credit"}
            value={formatMoney(Math.abs(bal))}
            strong
          />
        </div>
      </Card>
    </div>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className="row"
      style={{ justifyContent: "space-between", padding: "4px 0", fontWeight: strong ? 700 : 400 }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
