import type { AuthClient } from "../auth/AuthClient";
import { MockAuth } from "../auth/MockAuth";
import { SupabaseAuth } from "../auth/SupabaseAuth";
import type { DataStore } from "./DataStore";
import { LocalStore } from "./LocalStore";
import { SupabaseStore } from "./SupabaseStore";

const mode = (import.meta.env.VITE_DATA_MODE as string | undefined) ?? "local";

/** True when the app is backed by Supabase (cloud + real login). */
export const isCloud = mode === "supabase";

export const store: DataStore = isCloud ? new SupabaseStore() : new LocalStore();
export const auth: AuthClient = isCloud ? new SupabaseAuth() : new MockAuth();
