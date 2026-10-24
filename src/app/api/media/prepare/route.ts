import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { validateUpload } from "@/lib/domain";
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== new URL(request.url).origin)
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const { db } = await requireAdmin();
    const { name, type, size } = await request.json();
    if (
      typeof name !== "string" ||
      name.length > 255 ||
      typeof size !== "number" ||
      typeof type !== "string"
    )
      throw new Error("Invalid file metadata.");
    const invalid = validateUpload(type, size);
    if (invalid) throw new Error(invalid);
    const id = crypto.randomUUID();
    const ext =
      type === "application/pdf"
        ? "pdf"
        : type === "image/jpeg"
          ? "jpg"
          : type === "image/png"
            ? "png"
            : "webp";
    const path = `${id}.${ext}`;
    const { error } = await db
      .from("media_assets")
      .insert({ id, path, name, mime: type, size });
    if (error) throw error;
    const { data, error: uploadError } = await db.storage
      .from("sage-media")
      .createSignedUploadUrl(path);
    if (uploadError) throw uploadError;
    return NextResponse.json(
      { id, path, token: data.token },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload preparation failed" },
      { status: 400 },
    );
  }
}
