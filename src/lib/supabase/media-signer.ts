import "server-only";
import { createClient } from "@supabase/supabase-js";
// Use only after a session/public client has authorized the requested media row.
// This client must never be used for content queries or editor mutations.
export function mediaSigner() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("Media download signing is not configured.");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
