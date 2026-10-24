import { list, rows, type Params } from "@/lib/data";
import { Heading, Empty, Pagination } from "@/components/ui";
export const metadata = { title: "Member directory" };
export default async function Members({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const p = await searchParams;
  const [data, committees, memberships, terms] = await Promise.all([
    list("people", p),
    rows("committees"),
    rows("committee_memberships"),
    rows("academic_terms"),
  ]);
  const current = terms.find((t) => t.is_current);
  return (
    <>
      <Heading
        eyebrow="OUR COMMUNITY"
        title="The scholars of SAGE"
        description="Many talents. Shared aspirations. Meet the people who make our community."
      />
      <section className="wrap section">
        <form className="filters">
          <label className="search-label">
            Name
            <input name="q" defaultValue={p.q} placeholder="Find a scholar…" />
          </label>
          <label>
            Department
            <input name="department" defaultValue={p.department} />
          </label>
          <label>
            Year / batch
            <input name="batch" defaultValue={p.batch} />
          </label>
          <label>
            Committee
            <select name="committee" defaultValue={p.committee}>
              <option value="">All committees</option>
              {committees.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Directory
            <select name="archive" defaultValue={p.archive || "false"}>
              <option value="false">Current members</option>
              <option value="true">Archive</option>
            </select>
          </label>
          <button className="button">Search</button>
        </form>
        {data.items.length ? (
          <div className="people-grid">
            {data.items.map((p) => (
              <div key={p.id} className="person-card">
                {p.photo_id ? (
                  <img
                    src={`/api/media/${p.photo_id}`}
                    alt={p.name || "Member"}
                  />
                ) : (
                  <div className="avatar-placeholder">{p.name?.charAt(0)}</div>
                )}
                <h3>{p.name}</h3>
                <p>{String(p.department || "")}</p>
                <small>{String(p.batch || "")}</small>
                {memberships
                  .filter(
                    (m) => m.person_id === p.id && m.term_id === current?.id,
                  )
                  .map((m) => (
                    <p key={m.id}>
                      <span className="pill">
                        {committees.find((c) => c.id === m.committee_id)?.name}
                      </span>
                    </p>
                  ))}
                <p>{String(p.bio || "")}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Meet our community soon"
            text="Published member profiles will appear in this directory."
          />
        )}
        <Pagination {...data} params={p} />
      </section>
    </>
  );
}
