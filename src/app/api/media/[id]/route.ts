import { NextResponse } from "next/server";
import { sessionDB, configured } from "@/lib/supabase/server";
import { mediaSigner } from "@/lib/supabase/media-signer";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (!configured()) return new NextResponse(null, { status: 404, headers });
  const { id } = await params;
  const db = await sessionDB();
  const { data, error } = await db
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .eq("state", "ready")
    .maybeSingle();
  if (error || !data) return new NextResponse(null, { status: 404, headers });
  if (!process.env.SUPABASE_SECRET_KEY)
    return new NextResponse("Downloads are temporarily unavailable.", {
      status: 503,
      headers,
    });
  const { data: link, error: signError } = await mediaSigner()
    .storage.from("sage-media")
    .createSignedUrl(
      data.path,
      60,
      data.mime === "application/pdf" ? { download: data.name } : undefined,
    );
  if (signError || !link)
    return new NextResponse(null, { status: 404, headers });
  return NextResponse.redirect(link.signedUrl, { headers });
}
