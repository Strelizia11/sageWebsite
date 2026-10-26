import { settings } from "@/lib/data";
import { Heading, Markdown, Empty } from "@/components/ui";
import { FULL_NAME } from "@/lib/domain";
export const metadata = { title: "About our organization" };
export default async function About() {
  const s = await settings();
  return (
    <>
      <Heading
        eyebrow="WHO WE ARE"
        title="Rooted in scholarship. United in purpose"
        description={FULL_NAME}
      />
      <section className="wrap section about-intro">
        <img
          src={s.logo_id ? `/api/media/${s.logo_id}` : "/udd-sage-logo.png"}
          alt="UDD-SAGE official seal"
        />
        <div>
          <h2>
            Excellence begins
            <br />
            with community.
          </h2>
          {s.description || s.background ? (
            <>
              <Markdown text={s.description} />
              <Markdown text={s.background} />
            </>
          ) : (
            <p className="muted">
              Our official organization background will be published here.
            </p>
          )}
        </div>
      </section>
      <section className="wrap section values-grid">
        {["mission", "vision", "objectives"].map((key) => (
          <div className="value-card" key={key}>
            <h2>Our {key}</h2>
            {s[key] ? (
              <Markdown text={s[key]} />
            ) : (
              <p className="muted">Official {key} to be published.</p>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
