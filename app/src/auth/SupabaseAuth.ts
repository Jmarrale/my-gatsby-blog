import { getSupabase } from "../data/supabaseClient";
import type { AuthClient, AuthUser } from "./AuthClient";

export class SupabaseAuth implements AuthClient {
  readonly requiresLogin = true;

  async currentUser(): Promise<AuthUser | null> {
    const { data } = await getSupabase().auth.getUser();
    return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { id: data.user.id, email: data.user.email ?? "" };
  }

  async signOut(): Promise<void> {
    await getSupabase().auth.signOut();
  }

  onChange(cb: (user: AuthUser | null) => void): () => void {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      cb(
        session?.user
          ? { id: session.user.id, email: session.user.email ?? "" }
          : null,
      );
    });
    return () => data.subscription.unsubscribe();
  }
}
