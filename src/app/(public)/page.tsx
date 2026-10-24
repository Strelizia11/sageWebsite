import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Award,
  Users,
} from "lucide-react";
import { settings, list, homepage } from "@/lib/data";
import { Card, Empty, SectionTitle } from "@/components/ui";
import { FULL_NAME, formatManilaDate } from "@/lib/domain";
export default async function Home() {
  const [s, news, nextExams, results, events, featured, announcements] =
    await Promise.all([
      settings(),
      list("posts"),
      homepage("examination"),
      list("results"),
      list("activities", { period: "upcoming" }),
      homepage("featured"),
      homepage("announcements"),
    ]);
  const exams = { items: nextExams };
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow light">
              <span className="gold-line" /> THE OFFICIAL HOME OF UDD-SAGE
            </p>
            <h1>
              Scholars today.
              <br />
              Leaders{" "}
              <em>
                for
                <br className="desktop-br" /> tomorrow.
              </em>
            </h1>
            <p className="hero-name">{FULL_NAME}</p>
            <p className="hero-description">
              {String(
                s.introduction ||
                  "A community brought together by scholarship, leadership, and the pursuit of greater excellence.",
              )}
            </p>
            <div className="hero-actions">
              <Link className="button gold-button" href="/about">
                Discover SAGE <ArrowUpRight size={18} />
              </Link>
              <Link className="hero-secondary" href="/activities">
                Explore activities <ArrowRight size={17} />
              </Link>
            </div>
          </div>
          <div className="hero-emblem">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="star star-one">✦</span>
            <span className="star star-two">✦</span>
            <img
              src={s.logo_id ? `/api/media/${s.logo_id}` : "/udd-sage-logo.png"}
              alt="Universidad de Dagupan Scholars’ Association for Greater Excellence official seal"
            />
            <div className="emblem-caption">
              <span>ONE COMMUNITY</span>
              <span>GREATER POSSIBILITIES</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom wrap">
          <span>EXCELLENCE IN EVERY ENDEAVOR</span>
          <span>
            UNIVERSIDAD DE DAGUPAN <span className="gold">↗</span>
          </span>
        </div>
      </section>
      <section className="quick-strip wrap" aria-label="Quick links">
        {[
          [
            "/examinations",
            "Examination schedules",
            "Plan your next step",
            BookOpen,
          ],
          ["/results", "Latest results", "View official releases", Award],
          [
            "/activities",
            "Upcoming activities",
            "Be part of the community",
            CalendarDays,
          ],
          ["/members", "Member directory", "Meet our scholars", Users],
        ].map(([href, title, sub, Icon]) => {
          const I = Icon as typeof Users;
          return (
            <Link key={String(href)} href={String(href)}>
              <I size={24} />
              <span>
                <strong>{String(title)}</strong>
                <small>{String(sub)}</small>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          );
        })}
      </section>
      {announcements.length > 0 && (
        <section className="wrap announcements">
          <p className="eyebrow">IMPORTANT ANNOUNCEMENTS</p>
          {announcements.map((a) => (
            <Link href={`/news/${a.slug}`} key={a.id}>
              {a.title}
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </section>
      )}
      <section className="wrap section">
        <SectionTitle
          label="FROM OUR COMMUNITY"
          title="The latest at SAGE"
          href="/news"
        />
        {(featured.length ? featured : news.items).length ? (
          <div className="cards">
            {(featured.length ? featured : news.items).slice(0, 3).map((x) => (
              <Card key={x.id} item={x} section="news" />
            ))}
          </div>
        ) : (
          <Empty
            title="Our next story starts here"
            text="Visit again for news, official announcements, and stories from the SAGE community."
          />
        )}
      </section>
      <section className="academic-band">
        <div className="wrap academic-grid">
          <div>
            <p className="eyebrow">YOUR ACADEMIC JOURNEY</p>
            <h2>
              A little preparation.
              <br />
              <em>A world of possibility.</em>
            </h2>
            <p>
              Find examination schedules, important reminders, and official
              results.
            </p>
            <Link className="text-link" href="/examinations">
              Examination information <ArrowRight size={18} />
            </Link>
          </div>
          <div className="academic-panels">
            <Link
              href={
                exams.items[0]
                  ? `/examinations/${exams.items[0].slug}`
                  : "/examinations"
              }
            >
              <span className="eyebrow">NEXT EXAMINATION</span>
              <h3>{exams.items[0]?.title || "Stay ready for what’s next"}</h3>
              <p>
                {exams.items[0]
                  ? formatManilaDate(exams.items[0].starts_at)
                  : "Schedules will be posted once announced."}
              </p>
              <ArrowUpRight size={22} />
            </Link>
            <Link href="/results">
              <span className="eyebrow">LATEST RESULTS</span>
              <h3>
                {results.items[0]?.title ||
                  "Official releases, all in one place"}
              </h3>
              <p>
                {results.items[0]
                  ? formatManilaDate(results.items[0].published_at)
                  : "Published examination results will appear here."}
              </p>
              <ArrowUpRight size={22} />
            </Link>
          </div>
        </div>
      </section>
      <section className="wrap section">
        <SectionTitle
          label="MAKE MOMENTS MATTER"
          title="Coming together"
          href="/activities"
        />
        {events.items.length ? (
          <div className="cards">
            {events.items.slice(0, 3).map((x) => (
              <Card key={x.id} item={x} section="activities" />
            ))}
          </div>
        ) : (
          <Empty
            title="More moments to look forward to"
            text="Our upcoming activities and events will be announced here."
          />
        )}
      </section>
      <section className="community-banner wrap">
        <div>
          <p className="eyebrow light">THE PEOPLE BEHIND THE PURPOSE</p>
          <h2>
            Different strengths.
            <br />
            <em>One SAGE community.</em>
          </h2>
        </div>
        <div>
          <p>
            Get to know our core officers and the committees that bring our
            organization together.
          </p>
          <Link className="button white-button" href="/officers">
            Meet our leadership <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      {String(s.quick_links || "")
        .split("\n")
        .filter((x) => x.includes("|")).length > 0 && (
        <section className="wrap section">
          <SectionTitle label="USEFUL RESOURCES" title="Quick links" />
          <div className="link-grid">
            {String(s.quick_links)
              .split("\n")
              .map((line, i) => {
                const [label, url] = line.split("|").map((x) => x.trim());
                return /^https?:\/\//.test(url || "") ? (
                  <a key={i} href={url} rel="noopener noreferrer">
                    {label}
                    <ArrowUpRight />
                  </a>
                ) : null;
              })}
          </div>
        </section>
      )}
    </>
  );
}
