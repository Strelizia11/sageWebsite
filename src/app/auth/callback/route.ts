import { NextResponse } from "next/server";
import { sessionDB } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/domain";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const db = await sessionDB();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(safeReturnPath(url.searchParams.get("next")), url.origin),
      );
  }
  return NextResponse.redirect(new URL("/admin/login", url.origin));
}
