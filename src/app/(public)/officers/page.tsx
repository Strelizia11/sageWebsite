import { rows, type Params } from "@/lib/data";
import { Heading } from "@/components/ui";
import { positions, committees } from "@/lib/domain";
export const metadata = { title: "Officers & committees" };
export default async function Officers({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const p = await searchParams;
  const [terms, people, assignments, memberships] = await Promise.all(
    [
      "academic_terms",
      "people",
      "officer_assignments",
      "committee_memberships",
    ].map(rows),
  );
  const term =
    terms.find((t) => t.id === p.term) ||
    terms.find((t) => t.is_current) ||
    terms[0];
  const person = (position: number) =>
    people.find(
      (p) =>
        p.id ===
        assignments.find(
          (a) => a.term_id === term?.id && a.position_id === position,
        )?.person_id,
    );
  return (
    <>
      <Heading
        eyebrow="LEADERSHIP IN SERVICE"
        title="The people behind the purpose"
        description="Meet our core officers and the four committees that bring SAGE together."
      />
      <section className="wrap section">
        <div className="section-title">
          <h2>Core officers</h2>
          {terms.length > 0 ? (
            <form className="inline-form">
              <label>
                Academic term
                <select name="term" defaultValue={term?.id}>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button">View</button>
            </form>
          ) : (
            <span className="pill">Academic term to be announced</span>
          )}
        </div>
        <div className="people-grid officers-grid">
          {positions.map((title, i) => {
            const p = person(i + 1);
            return (
              <div key={title} className="person-card">
                <span className="office-number">0{i + 1}</span>
                {p?.photo_id ? (
                  <img src={`/api/media/${p.photo_id}`} alt={p.name || title} />
                ) : (
                  <div className="avatar-placeholder">
                    {p?.name?.charAt(0) || "✦"}
                  </div>
                )}
                <p className="eyebrow">{title}</p>
                <h3>{p?.name || "Position vacant"}</h3>
                <p>{String(p?.bio || "")}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="committee-band">
        <div className="wrap section">
          <p className="eyebrow">WORKING TOGETHER</p>
          <h2>Our committees</h2>
          <div className="committee-grid">
            {committees.map((name, i) => {
              const head = person(i + 5);
              const co = people.find(
                (p) =>
                  p.id ===
                  memberships.find(
                    (m) =>
                      m.term_id === term?.id &&
                      m.committee_id === i + 1 &&
                      m.role === "co_head",
                  )?.person_id,
              );
              return (
                <div className="committee-card" key={name}>
                  <span className="value-number">0{i + 1}</span>
                  <h3>{name}</h3>
                  <dl>
                    <dt>COMMITTEE HEAD</dt>
                    <dd>{head?.name || "Position vacant"}</dd>
                    <dt>CO-HEAD</dt>
                    <dd>{co?.name || "Position vacant"}</dd>
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
