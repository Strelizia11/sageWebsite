"use server";
import { requireAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
export async function removeMedia(id: string) {
  try {
    const { db } = await requireAdmin();
    const { data } = await db
      .from("media_assets")
      .select("path")
      .eq("id", id)
      .single();
    if (!data) return { error: "File not found." };
    const { error } = await db.from("media_assets").delete().eq("id", id);
    if (error)
      return {
        error: "This file is attached to content. Detach it before deleting.",
      };
    const removed = await db.storage.from("sage-media").remove([data.path]);
    if (removed.error)
      return {
        error:
          "Media record removed but storage cleanup failed. Remove the orphan object in Supabase Storage.",
      };
    revalidatePath("/admin/media");
    return { error: null };
  } catch {
    return { error: "Administrator session required." };
  }
}
