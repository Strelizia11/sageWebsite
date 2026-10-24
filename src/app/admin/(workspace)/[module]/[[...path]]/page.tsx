import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminPage as requireAdmin } from "@/lib/supabase/server";
import { modules, type Table } from "@/lib/schema";
import {
  type Row,
  parsePage,
  formatManilaDate,
  formatTime,
} from "@/lib/domain";
import { Editor } from "@/components/admin/editor";
import { Markdown, Pagination } from "@/components/ui";
import { attachmentTable } from "@/lib/data";
export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string; path?: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { module, path = [] } = await params;
  if (!Object.hasOwn(modules, module)) notFound();
  const table = module as Table;
  const { db } = await requireAdmin();
  const cfg = modules[table];
  if (path.length > 2) notFound();
  if (!path.length && table === "site_settings") {
    const { data, error } = await db.from(table).select("id").single();
    if (error) throw error;
    redirect(`/admin/${table}/${data.id}`);
  }
  if (path.length) {
    const id = path[0];
    let record: Row | null = null;
    if (id !== "new") {
      const { data, error } = await db
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) notFound();
      record = data as Row;
    }
    const attachment = attachmentTable(table);
    const files =
      record && attachment
        ? await db
            .from(attachment)
            .select("*")
            .eq("parent_id", record.id)
            .order("sort_order")
        : null;
    if (files?.error) throw files.error;
    if (path[1] === "preview" && record) {
      return (
        <article>
          <p className="pill">Administrator preview · {record.status}</p>
          <h1>{record.title || record.name}</h1>
          <p>{record.excerpt}</p>
          {record.starts_at && (
            <div className="event-info">
              <strong>
                {formatManilaDate(record.starts_at)} ·{" "}
                {formatTime(record.starts_at)} PHT
              </strong>
              {record.ends_at && (
                <span>
                  Until {formatManilaDate(record.ends_at)} ·{" "}
                  {formatTime(record.ends_at)} PHT
                </span>
              )}
              {!!record.cancelled && (
                <strong className="error-text">Cancelled examination</strong>
              )}
            </div>
          )}
          {record.cover_id && (
            <img
              className="article-cover"
              src={`/api/media/${record.cover_id}`}
              alt={String(record.title)}
            />
          )}
          <Markdown text={record.body} />
          {["venue", "instructions", "reminders", "highlights"].map((k) =>
            record?.[k] ? (
              <section key={k}>
                <h2>{k}</h2>
                <Markdown text={record[k]} />
              </section>
            ) : null,
          )}
          {files?.data?.map((a) => (
            <p key={a.id}>
              <a
                href={`/api/media/${a.asset_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {a.caption || "View attachment"} ↗
              </a>
            </p>
          ))}
        </article>
      );
    }
    if (path[1]) notFound();
    const relations = [
      ...new Set([
        "media_assets",
        ...cfg.fields.flatMap((f) => (f.relation ? [f.relation] : [])),
      ]),
    ];
    const entries = await Promise.all(
      relations.map(async (t) => {
        let q = db.from(t).select("*").limit(1000);
        if (t === "media_assets") q = q.eq("state", "ready");
        const { data, error } = await q;
        if (error) throw error;
        return [t, data || []] as const;
      }),
    );
    return (
      <Editor
        key={record?.id || "new"}
        table={table}
        record={record}
        options={Object.fromEntries(entries)}
        initialAttachments={files?.data || []}
      />
    );
  }
  const p = await searchParams;
  const page = parsePage(p.page);
  let q = db.from(table).select("*", { count: "exact" });
  const hasStatus = cfg.fields.some((f) => f.key === "status");
  if (hasStatus && ["draft", "published", "archived"].includes(p.status || ""))
    q = q.eq("status", p.status);
  if (table === "posts" && ["news", "announcement"].includes(p.type || ""))
    q = q.eq("type", p.type);
  if (p.q && cfg.fields.some((f) => f.key === "title" || f.key === "name"))
    q = q.ilike(
      cfg.fields.some((f) => f.key === "title") ? "title" : "name",
      `%${p.q.slice(0, 100).replace(/[%_\\]/g, "")}%`,
    );
  const { data, error, count } = await q
    .order("updated_at", { ascending: false })
    .range((page - 1) * 12, page * 12 - 1);
  if (error) throw error;
  const relationEntries = await Promise.all(
    [
      ...new Set(cfg.fields.flatMap((f) => (f.relation ? [f.relation] : []))),
    ].map(async (t) => {
      const { data } = await db.from(t).select("*").limit(1000);
      return [t, data || []] as const;
    }),
  );
  const options = Object.fromEntries(relationEntries);
  const label = (r: Row) =>
    r.title ||
    r.name ||
    cfg.fields
      .filter((f) => f.relation)
      .map(
        (f) =>
          (options[f.relation!] as Row[]).find(
            (x) => String(x.id) === String(r[f.key]),
          )?.name || "Unassigned",
      )
      .join(" · ");
  return (
    <>
      <div className="section-title">
        <div>
          <p className="eyebrow">CONTENT MANAGEMENT</p>
          <h1>{cfg.label}</h1>
        </div>
        <Link className="button" href={`/admin/${table}/new`}>
          + Create
        </Link>
      </div>
      <form className="filters">
        <label className="search-label">
          Search
          <input name="q" defaultValue={p.q} placeholder="Search records…" />
        </label>
        <button className="button secondary-button">Search</button>
        {hasStatus && (
          <label>
            Visibility
            <select name="status" defaultValue={p.status}>
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        )}
        {table === "posts" && (
          <label>
            Type
            <select name="type" defaultValue={p.type}>
              <option value="">All updates</option>
              <option value="news">News</option>
              <option value="announcement">Announcements</option>
            </select>
          </label>
        )}
      </form>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Record</th>
              <th>Status</th>
              <th>Last updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((r: Row) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/${table}/${r.id}`}>{label(r)}</Link>
                </td>
                <td>
                  <span className={`badge ${r.status || ""}`}>
                    {r.status || "Active"}
                  </span>
                </td>
                <td>
                  {r.updated_at
                    ? new Date(r.updated_at).toLocaleDateString("en-PH", {
                        timeZone: "Asia/Manila",
                      })
                    : ""}
                </td>
                <td>
                  <Link href={`/admin/${table}/${r.id}`}>Edit →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && (
          <div className="empty">
            No records yet. Create your first one above.
          </div>
        )}
      </div>
      <Pagination page={page} total={count || 0} params={p} />
    </>
  );
}
