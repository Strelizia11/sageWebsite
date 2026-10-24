"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
const links = [
  ["/about", "About"],
  ["/news", "News"],
  ["/officers", "Officers"],
  ["/members", "Members"],
  ["/examinations", "Examinations"],
  ["/results", "Results"],
  ["/activities", "Activities"],
];
export function Header({ logo = "/udd-sage-logo.png" }: { logo?: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <div className="topline">
        <span>UNIVERSIDAD DE DAGUPAN</span>
        <span>Scholarship. Leadership. Service.</span>
      </div>
      <header className="header">
        <Link href="/" className="brand" aria-label="UDD-SAGE home">
          <img src={logo} alt="UDD-SAGE seal" width="48" height="48" />
          <span>
            UDD<span className="brand-divider">/</span>SAGE
            <small>SCHOLARS’ ASSOCIATION</small>
          </span>
        </Link>
        <button
          className="menu-button"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav aria-label="Main navigation" className={open ? "nav open" : "nav"}>
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={path.startsWith(href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="contact-link"
            href="/contact"
            onClick={() => setOpen(false)}
          >
            Contact us <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
    </>
  );
}
