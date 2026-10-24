import { notFound } from "next/navigation";
import { publicModules } from "@/lib/domain";
import { list, rows, type Params } from "@/lib/data";
import { Heading, Card, Empty, Pagination } from "@/components/ui";
import { ScheduleNotice } from "@/components/schedule-notice";
type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<Params>;
};
export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  return {
    title:
      publicModules[section as keyof typeof publicModules]?.label || "Page",
  };
}
export default async function Listing({ params, searchParams }: Props) {
  const { section } = await params;
  const config = publicModules[section as keyof typeof publicModules];
  if (!config) notFound();
  const p = await searchParams;
  const data = await list(config.table, p);
  const exams = section === "results" ? await rows("examinations") : [];
  const noSchedule =
    section === "examinations" &&
    data.total === 0 &&
    !p.q &&
    !p.period &&
    p.archive !== "true";
  return (
    <>
      <Heading
        title={config.label}
        eyebrow={config.eyebrow}
        description={config.description}
      />
      {noSchedule ? (
        <section className="wrap section">
          <ScheduleNotice />
        </section>
      ) : (
        <section className="wrap section">
          <form className="filters">
            <label className="search-label">
              Search
              <input
                name="q"
                placeholder={`Search ${section}…`}
                defaultValue={p.q}
              />
            </label>
            {section === "news" && (
              <label>
                Type
                <select name="type" defaultValue={p.type}>
                  <option value="">All updates</option>
                  <option value="news">News</option>
                  <option value="announcement">Announcements</option>
                </select>
              </label>
            )}
            {["activities", "examinations"].includes(section) && (
              <label>
                When
                <select name="period" defaultValue={p.period}>
                  <option value="">All dates</option>
                  <option value="upcoming">Upcoming / ongoing</option>
                  <option value="past">Past</option>
                </select>
              </label>
            )}
            {section === "results" && (
              <>
                <label>
                  Examination
                  <select name="examination" defaultValue={p.examination}>
                    <option value="">All examinations</option>
                    {exams.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Year
                  <input
                    name="year"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    placeholder="e.g. 2026"
                    defaultValue={p.year}
                  />
                </label>
              </>
            )}
            <label>
              Collection
              <select name="archive" defaultValue={p.archive || "false"}>
                <option value="false">Latest</option>
                <option value="true">Archive</option>
              </select>
            </label>
            <button className="button" type="submit">
              Apply filters
            </button>
          </form>
          <p className="result-count">
            {data.total} {data.total === 1 ? "update" : "updates"}
            {p.archive === "true" ? " in the archive" : ""}
          </p>
          {data.items.length ? (
            <div className="cards">
              {data.items.map((x) => (
                <Card key={x.id} item={x} section={section} />
              ))}
            </div>
          ) : (
            <Empty
              title={p.q ? "No matching updates" : "No updates published yet"}
              text={
                p.q
                  ? "Try a different search or adjust the filters."
                  : "Official information will be posted here when available."
              }
            />
          )}
          <Pagination {...data} params={p} />
        </section>
      )}
    </>
  );
}
