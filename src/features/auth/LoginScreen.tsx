import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { brand } from "../../brand";
import { Button, Card, Field } from "../../components/ui";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <Card className="card--pad login-card">
        <div style={{ marginBottom: "var(--s-6)" }}>
          <div className="brandmark">{brand.name}</div>
          <div className="brandmark__tag">{brand.tagline}</div>
        </div>
        <form onSubmit={submit}>
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && <div className="error-text">{error}</div>}
          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            style={{ width: "100%", marginTop: "var(--s-3)" }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
