import { useMemo } from "react";
import { Card, EmptyState, LinkButton, StatTile } from "../../components/ui";
import { PaymentRow } from "../../components/rows";
import { store } from "../../data";
import { useData } from "../../lib/useData";
import { revenueThisMonth } from "../../lib/billing";
import { formatMoney } from "../../lib/money";
import type { Payment } from "../../data/types";

export function PaymentsScreen() {
  const { data } = useData(async () => {
    const [payments, students] = await Promise.all([
      store.listPayments(),
      store.listStudents(),
    ]);
    return { payments, students };
  });

  const view = useMemo(() => {
    if (!data) return null;
    const nameById = new Map(data.students.map((s) => [s.id, s.name]));
    const sorted = [...data.payments].sort((a, b) => b.paidOn.localeCompare(a.paidOn));
    const byMonth = new Map<string, Payment[]>();
    for (const p of sorted) {
      const key = p.paidOn.slice(0, 7);
      const arr = byMonth.get(key) ?? [];
      arr.push(p);
      byMonth.set(key, arr);
    }
    return {
      nameById,
      month: revenueThisMonth(data.payments),
      all: data.payments.reduce((s, p) => s + p.amountCents, 0),
      groups: [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])),
    };
  }, [data]);

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="title-group">
          <div className="screen-eyebrow">Revenue</div>
          <h1 className="screen-title">Payments</h1>
        </div>
        <LinkButton to="/payments/new" variant="primary" size="sm">
          + Payment
        </LinkButton>
      </header>

      {data && data.payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          message="Record a payment to start tracking revenue."
          action={
            <LinkButton to="/payments/new" variant="primary">
              Record payment
            </LinkButton>
          }
        />
      ) : (
        view && (
          <>
            <div className="tiles tiles--2">
              <StatTile label="This month" value={formatMoney(view.month)} emphasis="warm" />
              <StatTile label="All time" value={formatMoney(view.all)} />
            </div>
            {view.groups.map(([key, items]) => (
              <div key={key}>
                <div className="section-label">
                  {new Date(key + "-01T00:00:00").toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <Card>
                  <ul className="list">
                    {items.map((p) => (
                      <PaymentRow
                        key={p.id}
                        payment={p}
                        studentName={view.nameById.get(p.studentId) ?? "—"}
                        to={`/payments/${p.id}`}
                      />
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </>
        )
      )}
    </div>
  );
}
