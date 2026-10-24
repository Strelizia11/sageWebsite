import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminPage as requireAdmin } from "@/lib/supabase/server";
import { modules } from "@/lib/schema";
import { signOut } from "../actions";
export default async function Workspace({
  children,
}: {
  children: React.ReactNode;
}) {
  let email = "";
  try {
    const { user } = await requireAdmin();
    email = user.email || "";
  } catch {
    redirect("/admin/login");
  }
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand">
          <img src="/udd-sage-logo.png" alt="" width="38" height="38" />
          UDD / SAGE
        </Link>
        <nav aria-label="Admin navigation">
          <Link href="/admin">Overview</Link>
          {Object.entries(modules).map(([key, value]) => (
            <Link key={key} href={`/admin/${key}`}>
              {value.label}
            </Link>
          ))}
          <Link href="/admin/media">Media library</Link>
          <Link href="/">↗ Public website</Link>
        </nav>
      </aside>
      <div className="admin-main">
        <div className="admin-top">
          <span>{email}</span>
          <form action={signOut}>
            <button className="button secondary-button">Sign out</button>
          </form>
        </div>
        <main id="main" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
