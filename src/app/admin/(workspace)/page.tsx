import Link from "next/link";
import { requireAdminPage as requireAdmin } from "@/lib/supabase/server";
import { modules, type Table } from "@/lib/schema";
export default async function Dashboard() {
  const { db } = await requireAdmin();
  const names: Table[] = [
    "posts",
    "people",
    "examinations",
    "results",
    "activities",
  ];
  const data = await Promise.all(
    names.map(async (name) => {
      const [drafts, published] = await Promise.all([
        db
          .from(name)
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        db
          .from(name)
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
      ]);
      if (drafts.error || published.error)
        throw new Error("Unable to load dashboard.");
      return {
        name,
        drafts: drafts.count || 0,
        published: published.count || 0,
      };
    }),
  );
  const recent = await Promise.all(
    names.map(async (table) => {
      const { data, error } = await db
        .from(table)
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data || []).map((x) => ({ ...x, table }));
    }),
  );
  return (
    <>
      <p className="eyebrow">YOUR PUBLISHING WORKSPACE</p>
      <h1>Welcome to your dashboard.</h1>
      <p className="muted">
        Keep your community informed, connected, and ready for what’s next.
      </p>
      <div className="dashboard-grid">
        {data.map((x) => (
          <Link className="admin-card" href={`/admin/${x.name}`} key={x.name}>
            <h3>{modules[x.name].label}</h3>
            <strong>{x.published}</strong>
            <p>Published · {x.drafts} drafts</p>
          </Link>
        ))}
        <Link className="admin-card" href="/admin/site_settings">
          <h3>Organization details</h3>
          <p>
            Update your introduction, About page, contact channels and useful
            links.
          </p>
        </Link>
      </div>
      <section className="section">
        <h2>Recently updated</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Content</th>
                <th>Module</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent
                .flat()
                .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
                .slice(0, 8)
                .map((x) => (
                  <tr key={x.id}>
                    <td>
                      <Link href={`/admin/${x.table}/${x.id}`}>
                        {x.title || x.name}
                      </Link>
                    </td>
                    <td>{modules[x.table as Table].label}</td>
                    <td>{x.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
