import { settings } from "@/lib/data";
import { Heading } from "@/components/ui";
import { Mail, MapPin, ArrowUpRight, Phone } from "lucide-react";
export const metadata = { title: "Contact" };
export default async function Contact() {
  const s = await settings();
  return (
    <>
      <Heading
        eyebrow="LET’S CONNECT"
        title="A conversation starts here"
        description="Find our official channels and get in touch with UDD-SAGE."
      />
      <section className="wrap section contact-grid">
        <div className="contact-intro">
          <h2>
            We’re part of
            <br />
            your community.
          </h2>
          <p>
            For organization inquiries, announcements, and activities, reach us
            through our official contact details.
          </p>
        </div>
        <div className="contact-details">
          <div>
            <Mail />
            <h3>Official email</h3>
            {s.email ? (
              <a href={`mailto:${s.email}`}>{String(s.email)}</a>
            ) : (
              <p>To be announced</p>
            )}
          </div>
          <div>
            <MapPin />
            <h3>Find us</h3>
            <p>{String(s.location || "Universidad de Dagupan")}</p>
          </div>
          {!!s.phone && (
            <div>
              <Phone />
              <h3>Contact number</h3>
              <p>{String(s.phone)}</p>
            </div>
          )}
          <div>
            <ArrowUpRight />
            <h3>Follow our community</h3>
            {s.social_url ? (
              <a
                href={String(s.social_url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official social page ↗
              </a>
            ) : (
              <p>Official social links will be posted here.</p>
            )}
            {String(s.social_links || "")
              .split("\n")
              .map((l, i) => {
                const [label, url] = l.split("|").map((x) => x.trim());
                return /^https?:\/\//.test(url || "") ? (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label} ↗
                  </a>
                ) : null;
              })}
          </div>
        </div>
      </section>
    </>
  );
}
