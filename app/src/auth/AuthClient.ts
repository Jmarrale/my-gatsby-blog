export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthClient {
  currentUser(): Promise<AuthUser | null>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  /** Subscribe to auth changes; returns an unsubscribe function. */
  onChange(cb: (user: AuthUser | null) => void): () => void;
  /** Whether this client requires real credentials (false for mock). */
  readonly requiresLogin: boolean;
}
