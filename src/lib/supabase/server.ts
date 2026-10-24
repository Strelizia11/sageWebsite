import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export function configured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
export function publicDB() {
  if (!configured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
      },
    },
  );
}
export async function sessionDB() {
  if (!configured())
    throw new Error(
      "Connect Supabase to enable administration. See docs/deployment.md.",
    );
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Read-only render; proxy refreshes cookies. */
          }
        },
      },
    },
  );
}
export async function requireAdmin() {
  const db = await sessionDB();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user)
    throw new Error("Your session expired. Sign in again, then retry.");
  const { data } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) throw new Error("Administrator access required.");
  return { db, user };
}
export async function requireAdminPage() {
  try {
    return await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
}
