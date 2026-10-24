"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sessionDB, requireAdmin } from "@/lib/supabase/server";
import { validateRecord, type Table } from "@/lib/schema";
import type { ActionResult, Row } from "@/lib/domain";
import { ZodError } from "zod";
function message(e: unknown) {
  if (e instanceof ZodError)
    return e.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join(" · ");
  return e instanceof Error ? e.message : "Unable to save. Please retry.";
}
export async function signIn(
  email: string,
  password: string,
): Promise<ActionResult> {
  try {
    const db = await sessionDB();
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error)
      return {
        ok: false,
        message: "Sign-in failed. Check your email and password.",
      };
    try {
      await requireAdmin();
    } catch {
      await db.auth.signOut();
      return {
        ok: false,
        message: "This account does not have administrator access.",
      };
    }
    return { ok: true, data: "/admin" };
  } catch (e) {
    return { ok: false, message: message(e) };
  }
}
export async function signOut() {
  const db = await sessionDB();
  await db.auth.signOut();
  redirect("/admin/login");
}
export async function recover(email: string): Promise<ActionResult> {
  try {
    const db = await sessionDB();
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (!site)
      return {
        ok: false,
        message: "Recovery is not configured. Contact the site administrator.",
      };
    const { error } = await db.auth.resetPasswordForEmail(email, {
      redirectTo: `${site}/auth/callback?next=/admin/recovery`,
    });
    if (error) throw error;
    return {
      ok: true,
      data: "If this account exists, a recovery email has been sent.",
    };
  } catch (e) {
    return { ok: false, message: message(e) };
  }
}
export async function changePassword(password: string): Promise<ActionResult> {
  try {
    if (password.length < 12) throw new Error("Use at least 12 characters.");
    const { db } = await requireAdmin();
    const { error } = await db.auth.updateUser({ password });
    if (error) throw error;
    return {
      ok: true,
      data: "Password updated. You can return to the dashboard.",
    };
  } catch (e) {
    return { ok: false, message: message(e) };
  }
}
export async function saveRecord(
  table: Table,
  id: string | null,
  input: unknown,
  updated: string | null,
  attachments: unknown[] = [],
): Promise<ActionResult> {
  try {
    const { db } = await requireAdmin();
    const payload = validateRecord(table, input);
    for (const key of ["social_links", "quick_links"])
      if (payload[key])
        for (const line of String(payload[key])
          .split("\n")
          .filter((x) => x.trim())) {
          const [label, url] = line.split("|").map((x) => x.trim());
          if (!label || !/^https?:\/\//.test(url || ""))
            throw new Error(`${key}: Use Label | https://url on each line.`);
        }
    const { data, error } = await db.rpc("save_content", {
      target: table,
      record_id: id,
      payload,
      expected_updated: updated,
      attachments: ["posts", "results", "activities"].includes(table)
        ? attachments
        : null,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/", "layout");
    return { ok: true, data: String(data) };
  } catch (e) {
    return { ok: false, message: message(e) };
  }
}
export async function deleteRecord(
  table: Table,
  id: string,
): Promise<ActionResult> {
  try {
    const { db } = await requireAdmin();
    if (table === "site_settings")
      throw new Error("Organization settings cannot be deleted.");
    const { error } = await db.from(table).delete().eq("id", id);
    if (error)
      throw new Error(
        "This record may be referenced elsewhere. Archive it or remove its assignments first.",
      );
    revalidatePath("/", "layout");
    return { ok: true, data: "Deleted" };
  } catch (e) {
    return { ok: false, message: message(e) };
  }
}
export async function refreshMedia(): Promise<ActionResult<Row[]>> {
  try {
    const { db } = await requireAdmin();
    const { data, error } = await db
      .from("media_assets")
      .select("*")
      .eq("state", "ready")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return { ok: true, data: data as Row[] };
  } catch (e) {
    return { ok: false, message: message(e) };
  }
}
