import type { MetadataRoute } from "next";
import { publicDB } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const result: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/news",
    "/officers",
    "/members",
    "/examinations",
    "/results",
    "/activities",
    "/contact",
  ].map((path) => ({ url: base + path }));
  const db = publicDB();
  if (db)
    for (const [section, table] of [
      ["news", "posts"],
      ["examinations", "examinations"],
      ["results", "results"],
      ["activities", "activities"],
    ]) {
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await db
          .from(table)
          .select("slug,updated_at")
          .in("status", ["published", "archived"])
          .order("id")
          .range(offset, offset + 499);
        if (error) throw error;
        result.push(
          ...(data || []).map((x) => ({
            url: `${base}/${section}/${x.slug}`,
            lastModified: new Date(x.updated_at),
          })),
        );
        if (!data || data.length < 500) break;
      }
    }
  return result;
}
