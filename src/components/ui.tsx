import Link from "next/link";
import { ArrowUpRight, ArrowRight, FileText, CalendarDays } from "lucide-react";
import { formatManilaDate, type Row } from "@/lib/domain";
import ReactMarkdown from "react-markdown";
export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="page-heading">
      <div className="wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {title}
          <span className="gold">.</span>
        </h1>
        {description && <p className="lede">{description}</p>}
      </div>
    </section>
  );
}
export function Empty({
  title = "Updates are on the way",
  text = "Official information will appear here once published.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <FileText size={25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Markdown({ text }: { text: unknown }) {
  return (
    <div className="prose">
      <ReactMarkdown skipHtml>
        {typeof text === "string" ? text : ""}
      </ReactMarkdown>
    </div>
  );
}
export function Card({ item, section }: { item: Row; section: string }) {
  return (
    <Link className="content-card" href={`/${section}/${item.slug}`}>
      {item.cover_id ? (
        <img
          className="card-image"
          src={`/api/media/${item.cover_id}`}
          alt={String(item.title)}
        />
      ) : (
        <div className={`card-art art-${section}`}>
          <span>UDD / SAGE</span>
          <span className="art-mark">✦</span>
        </div>
      )}
      <div className="card-body">
        <div className="meta">
          <span>{String(item.type || section).replace("_", " ")}</span>
          <span>{formatManilaDate(item.starts_at || item.published_at)}</span>
        </div>
        <h3>{item.title}</h3>
        {!!item.cancelled && (
          <p className="error-text">Cancelled examination</p>
        )}
        <p>{item.excerpt}</p>
        <span className="text-link">
          Read more <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}
export function SectionTitle({
  label,
  title,
  href,
}: {
  label: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          View all <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function Pagination({
  page,
  total,
  params,
}: {
  page: number;
  total: number;
  params: Record<string, string | undefined>;
}) {
  const count = Math.ceil(total / 12);
  if (count < 2) return null;
  const url = (p: number) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(
        (x): x is [string, string] => x[1] !== undefined,
      ),
    );
    q.set("page", String(p));
    return "?" + q;
  };
  return (
    <nav aria-label="Pagination" className="pagination">
      {page > 1 && <Link href={url(page - 1)}>← Previous</Link>}
      <span>
        Page {page} of {count}
      </span>
      {page < count && <Link href={url(page + 1)}>Next →</Link>}
    </nav>
  );
}
export function DateLine({ iso }: { iso?: string }) {
  return (
    <span className="date-line">
      <CalendarDays size={17} />
      {formatManilaDate(iso)}
    </span>
  );
}
