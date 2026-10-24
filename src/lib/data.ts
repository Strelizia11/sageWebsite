import "server-only";
import { publicDB } from "./supabase/server";
import { FULL_NAME, type Row, parsePage } from "./domain";
import { homeQuery, relatedQuery } from "./public-queries";
export async function homepage(
  kind: "featured" | "announcements" | "examination",
): Promise<Row[]> {
  const db = publicDB();
  if (!db) return [];
  const { data, error } = await homeQuery(db, kind);
  if (error) throw error;
  return data as Row[];
}
export async function related(table: string, item: Row): Promise<Row[]> {
  const db = publicDB();
  if (!db || !["results", "examinations"].includes(table)) return [];
  const { data, error } = await relatedQuery(db, table, item);
  if (error) throw error;
  return data as Row[];
}
export async function settings(): Promise<Row> {
  const db = publicDB();
  if (!db) return { id: "", name: FULL_NAME };
  const { data, error } = await db.from("site_settings").select("*").single();
  if (error)
    throw new Error("Organization information is temporarily unavailable.");
  return data as Row;
}
export type Params = Record<string, string | undefined>;
export async function list(
  table: string,
  p: Params = {},
): Promise<{ items: Row[]; total: number; page: number }> {
  const page = parsePage(p.page);
  const db = publicDB();
  if (!db) return { items: [], total: 0, page };
  let q = db
    .from(table)
    .select("*", { count: "exact" })
    .eq("status", p.archive === "true" ? "archived" : "published");
  const term = (p.q || "")
    .trim()
    .slice(0, 100)
    .replace(/[%_\\]/g, "");
  if (term) q = q.ilike(table === "people" ? "name" : "title", `%${term}%`);
  if (table === "posts" && ["news", "announcement"].includes(p.type || ""))
    q = q.eq("type", p.type);
  if (table === "people") {
    if (p.department) q = q.eq("department", p.department);
    if (p.batch) q = q.eq("batch", p.batch);
    if (p.committee) {
      const { data: members, error } = await db
        .from("committee_memberships")
        .select("person_id")
        .eq("committee_id", p.committee);
      if (error) throw error;
      q = q.in(
        "id",
        (members || []).map((m) => m.person_id),
      );
    }
  }
  if (table === "results") {
    if (p.examination) q = q.eq("examination_id", p.examination);
    if (/^\d{4}$/.test(p.year || ""))
      q = q
        .gte("published_at", `${p.year}-01-01T00:00:00+08:00`)
        .lt("published_at", `${Number(p.year) + 1}-01-01T00:00:00+08:00`);
  }
  if (["activities", "examinations"].includes(table) && p.period) {
    const now = new Date().toISOString();
    if (table === "examinations")
      q =
        p.period === "past" ? q.lt("starts_at", now) : q.gte("starts_at", now);
    else
      q = q.or(
        p.period === "past"
          ? `ends_at.lt.${now},and(ends_at.is.null,starts_at.lt.${now})`
          : `ends_at.gte.${now},and(ends_at.is.null,starts_at.gte.${now})`,
      );
  }
  const sort =
    table === "people"
      ? "name"
      : p.period === "upcoming"
        ? "starts_at"
        : "published_at";
  const { data, error, count } = await q
    .order(sort, { ascending: table === "people" || p.period === "upcoming" })
    .order("id")
    .range((page - 1) * 12, page * 12 - 1);
  if (error)
    throw new Error("Unable to load this directory. Please try again.");
  return { items: (data || []) as Row[], total: count || 0, page };
}
export async function detail(table: string, slug: string) {
  const db = publicDB();
  if (!db) return null;
  const { data, error } = await db
    .from(table)
    .select("*")
    .eq("slug", slug)
    .in("status", ["published", "archived"])
    .maybeSingle();
  if (error) throw error;
  return data as Row | null;
}
export async function rows(table: string) {
  const db = publicDB();
  if (!db) return [] as Row[];
  const { data, error } = await db.from(table).select("*").limit(1000);
  if (error) throw error;
  return (data || []) as Row[];
}
export function attachmentTable(table: string) {
  return (
    {
      posts: "post_attachments",
      results: "result_attachments",
      activities: "activity_media",
    } as Record<string, string>
  )[table];
}
export async function attachments(table: string, id: string) {
  const db = publicDB(),
    t = attachmentTable(table);
  if (!db || !t) return [];
  const { data, error } = await db
    .from(t)
    .select("*,media_assets(name,mime,alt)")
    .eq("parent_id", id)
    .order("sort_order");
  if (error) throw error;
  return data || [];
}
