import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth } from "../data";
import type { AuthUser } from "./AuthClient";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  requiresLogin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    auth.currentUser().then((u) => {
      if (alive) {
        setUser(u);
        setLoading(false);
      }
    });
    const unsub = auth.onChange((u) => alive && setUser(u));
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      requiresLogin: auth.requiresLogin,
      signIn: async (email, password) => {
        const u = await auth.signIn(email, password);
        setUser(u);
      },
      signOut: async () => {
        await auth.signOut();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
