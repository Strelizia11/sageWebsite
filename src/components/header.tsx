"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const path = usePathname();
  useEffect(() => {
    if (!open) return;
    navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const resize = () => {
      if (window.innerWidth > 950) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  return (
    <>
      <div className="topline">
        <span>UNIVERSIDAD DE DAGUPAN</span>
        <span>Scholarship. Leadership. Service.</span>
      </div>
      <header
        className="header"
        ref={headerRef}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false);
            toggleRef.current?.focus();
          }
        }}
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            !event.currentTarget.contains(event.relatedTarget)
          )
            setOpen(false);
        }}
      >
        <Link href="/" className="brand" aria-label="UDD-SAGE home">
          <img src={logo} alt="UDD-SAGE seal" width="48" height="48" />
          <span>
            UDD<span className="brand-divider">/</span>SAGE
            <small>SCHOLARS’ ASSOCIATION</small>
          </span>
        </Link>
        <button
          className="menu-button"
          type="button"
          ref={toggleRef}
          aria-controls="main-navigation"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          ref={navRef}
          id="main-navigation"
          aria-label="Main navigation"
          className={open ? "nav open" : "nav"}
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={path.startsWith(href) ? "active" : ""}
              aria-current={
                path === href || path.startsWith(`${href}/`)
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="contact-link"
            href="/contact"
            aria-current={path === "/contact" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Contact us <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
    </>
  );
}
