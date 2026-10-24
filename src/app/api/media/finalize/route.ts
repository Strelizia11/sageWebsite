import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { validateUpload, validateSignature } from "@/lib/domain";
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const { db } = await requireAdmin();
    const { id, alt } = await request.json();
    const { data: asset, error } = await db
      .from("media_assets")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    if (
      asset.mime.startsWith("image/") &&
      (!alt || typeof alt !== "string" || !alt.trim())
    )
      throw new Error("Describe the image for accessibility.");
    const { data: file, error: readError } = await db.storage
      .from("sage-media")
      .download(asset.path);
    if (readError || !file)
      throw new Error("The upload has not finished. Retry in a moment.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (
      validateUpload(asset.mime, bytes.length) ||
      bytes.length !== asset.size ||
      !validateSignature(bytes, asset.mime)
    ) {
      await db.storage.from("sage-media").remove([asset.path]);
      await db.from("media_assets").delete().eq("id", id);
      throw new Error(
        "File content does not match the selected file type or size.",
      );
    }
    const { error: updateError } = await db
      .from("media_assets")
      .update({
        state: "ready",
        alt: typeof alt === "string" ? alt.trim().slice(0, 500) : "",
      })
      .eq("id", id);
    if (updateError) throw updateError;
    return NextResponse.json(
      { id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unable to finalize upload" },
      { status: 400 },
    );
  }
}
