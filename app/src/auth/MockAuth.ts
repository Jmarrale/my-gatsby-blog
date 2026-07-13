import type { AuthClient, AuthUser } from "./AuthClient";

// Local/demo auth: an instant fixed session so protected routes render with
// no backend. Never used when VITE_DATA_MODE=supabase.
const DEMO_USER: AuthUser = { id: "local-owner", email: "demo@tatami.app" };

export class MockAuth implements AuthClient {
  readonly requiresLogin = false;

  async currentUser(): Promise<AuthUser | null> {
    return DEMO_USER;
  }
  async signIn(): Promise<AuthUser> {
    return DEMO_USER;
  }
  async signOut(): Promise<void> {
    /* no-op in demo mode */
  }
  onChange(cb: (user: AuthUser | null) => void): () => void {
    cb(DEMO_USER);
    return () => {};
  }
}
