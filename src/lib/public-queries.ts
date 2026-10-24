import type { SupabaseClient } from "@supabase/supabase-js";
import type { Row } from "./domain";
export function homeQuery(
  db: SupabaseClient,
  kind: "featured" | "announcements" | "examination",
) {
  if (kind === "examination")
    return db
      .from("examinations")
      .select("*")
      .eq("status", "published")
      .eq("cancelled", false)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .order("id")
      .limit(1);
  let q = db.from("posts").select("*").eq("status", "published");
  q =
    kind === "featured"
      ? q.eq("featured", true)
      : q.eq("type", "announcement").eq("important", true);
  return q.order("published_at", { ascending: false }).order("id").limit(3);
}
export function relatedQuery(db: SupabaseClient, table: string, item: Row) {
  return table === "results"
    ? db
        .from("examinations")
        .select("*")
        .eq("id", String(item.examination_id))
        .in("status", ["published", "archived"])
        .limit(1)
    : db
        .from("results")
        .select("*")
        .eq("examination_id", item.id)
        .in("status", ["published", "archived"])
        .order("published_at", { ascending: false })
        .limit(100);
}
