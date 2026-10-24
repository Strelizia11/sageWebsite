import { notFound } from "next/navigation";
import Link from "next/link";
import { publicModules, formatManilaDate, formatTime } from "@/lib/domain";
import { detail, attachments, related } from "@/lib/data";
import { Markdown } from "@/components/ui";
type Props = { params: Promise<{ section: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { section, slug } = await params;
  const cfg = publicModules[section as keyof typeof publicModules];
  const item = cfg ? await detail(cfg.table, slug) : null;
  return { title: item?.title || "Not found", description: item?.excerpt };
}
export default async function Article({ params }: Props) {
  const { section, slug } = await params;
  const config = publicModules[section as keyof typeof publicModules];
  if (!config) notFound();
  const item = await detail(config.table, slug);
  if (!item) notFound();
  const media = await attachments(config.table, item.id);
  const linked = await related(config.table, item);
  return (
    <article className="wrap article">
      <Link className="text-link" href={`/${section}`}>
        ← {config.label}
      </Link>
      <div className="article-title">
        <p className="eyebrow">
          {String(item.type || section)}{" "}
          {item.status === "archived" ? " / ARCHIVE" : ""}
        </p>
        <h1>{item.title}</h1>
        <p className="lede">{item.excerpt}</p>
        <p className="meta">Published {formatManilaDate(item.published_at)}</p>
      </div>
      {item.cover_id && (
        <img
          className="article-cover"
          src={`/api/media/${item.cover_id}`}
          alt={String(item.title)}
        />
      )}
      <div className="article-content">
        {linked.length > 0 && (
          <section className="event-info">
            <strong>
              {section === "results"
                ? "Related examination"
                : "Published results"}
            </strong>
            {linked.map((x) => (
              <Link
                key={x.id}
                className="text-link"
                href={`/${section === "results" ? "examinations" : "results"}/${x.slug}`}
              >
                {x.title} →
              </Link>
            ))}
          </section>
        )}
        {item.starts_at && (
          <div className="event-info">
            <strong>
              {formatManilaDate(item.starts_at)} · {formatTime(item.starts_at)}{" "}
              PHT
            </strong>
            {item.ends_at && (
              <span>
                Until {formatManilaDate(item.ends_at)} ·{" "}
                {formatTime(item.ends_at)} PHT
              </span>
            )}
            <span>{String(item.venue || "Venue to be announced")}</span>
            {!!item.cancelled && (
              <strong className="error-text">
                This examination has been cancelled.
              </strong>
            )}
          </div>
        )}
        <Markdown text={item.body} />
        {["instructions", "reminders", "highlights"].map((key) =>
          item[key] ? (
            <section key={key}>
              <h2>{key[0].toUpperCase() + key.slice(1)}</h2>
              <Markdown text={item[key]} />
            </section>
          ) : null,
        )}
        {media.length > 0 && (
          <section>
            <h2>
              {section === "activities"
                ? "In pictures"
                : "Downloads & attachments"}
            </h2>
            <div className="attachment-grid">
              {media.map((a) =>
                a.media_assets?.mime.startsWith("image/") ? (
                  <figure key={a.id}>
                    <a
                      href={`/api/media/${a.asset_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`/api/media/${a.asset_id}`}
                        alt={a.media_assets.alt}
                      />
                    </a>
                    <figcaption>{a.caption}</figcaption>
                  </figure>
                ) : (
                  <a
                    className="download"
                    key={a.id}
                    href={`/api/media/${a.asset_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ↓ {a.caption || a.media_assets?.name || "Download file"}{" "}
                    <small>PDF document</small>
                  </a>
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
