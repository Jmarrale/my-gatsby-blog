import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { brand } from "../../brand";
import { Button, Card, Field } from "../../components/ui";
import { isCloud, store } from "../../data";
import { centsToDollars, dollarsToCents } from "../../lib/money";

export function SettingsScreen() {
  const { signOut, requiresLogin } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [rate, setRate] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    store.getProfile().then((p) => {
      setBusinessName(p.businessName);
      setRate(p.defaultRateCents ? String(centsToDollars(p.defaultRateCents)) : "");
      setLoaded(true);
    });
  }, []);

  async function save() {
    await store.updateProfile({
      businessName: businessName.trim() || brand.defaultBusinessName,
      defaultRateCents: rate === "" ? 0 : dollarsToCents(rate),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function resetDemo() {
    if (store.resetDemo && confirm("Reset all data back to the sample data?")) {
      await store.resetDemo();
      location.reload();
    }
  }

  if (!loaded) return <div className="screen muted" style={{ paddingTop: 40 }}>Loading…</div>;

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="title-group">
          <div className="screen-eyebrow">{brand.name}</div>
          <h1 className="screen-title">Settings</h1>
        </div>
      </header>

      {!isCloud && (
        <div className="banner">
          Demo mode — data is stored only in this browser. Connect a backend to sync and back up.
        </div>
      )}

      <Card className="card--pad">
        <Field label="Business name" hint="Shown on statements">
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </Field>
        <Field label="Default lesson rate" hint="Dollars, used when a student has no rate set">
          <input type="number" inputMode="decimal" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Button variant="primary" onClick={save}>
          {saved ? "Saved ✓" : "Save settings"}
        </Button>
      </Card>

      <div style={{ marginTop: "var(--s-6)" }} className="stack">
        {store.resetDemo && (
          <Button variant="default" onClick={resetDemo} style={{ marginBottom: "var(--s-3)" }}>
            Reset to sample data
          </Button>
        )}
        {requiresLogin && (
          <Button variant="danger" onClick={() => signOut()}>
            Sign out
          </Button>
        )}
      </div>

      <p className="muted center" style={{ marginTop: "var(--s-8)", fontSize: "var(--step--1)" }}>
        {brand.name} · {brand.tagline}
      </p>
    </div>
  );
}
