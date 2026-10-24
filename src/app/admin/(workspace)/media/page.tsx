import { requireAdminPage as requireAdmin } from "@/lib/supabase/server";
import { MediaLibrary } from "@/components/admin/media-library";
import { Pagination } from "@/components/ui";
import { parsePage } from "@/lib/domain";
export default async function Media({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const page = parsePage(p.page);
  const { db } = await requireAdmin();
  const { data, error, count } = await db
    .from("media_assets")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * 12, page * 12 - 1);
  if (error) throw error;
  return (
    <>
      <MediaLibrary assets={data || []} />
      <Pagination page={page} total={count || 0} params={p} />
    </>
  );
}
