import Link from "next/link";
import { Header } from "@/components/header";
import { FULL_NAME } from "@/lib/domain";
import { settings } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await settings();
  return (
    <>
      <Header logo={s.logo_id ? `/api/media/${s.logo_id}` : undefined} />
      <main id="main">{children}</main>
      <footer>
        <div className="wrap footer-grid">
          <div>
            <div className="footer-brand">
              UDD <span>/</span> SAGE
            </div>
            <p>{FULL_NAME}</p>
          </div>
          <div>
            <p className="eyebrow">EXPLORE</p>
            <Link href="/about">Our organization</Link>
            <Link href="/officers">Our leadership</Link>
            <Link href="/members">Our community</Link>
          </div>
          <div>
            <p className="eyebrow">STAY CONNECTED</p>
            <Link href="/news">News & announcements</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/admin">Administrator sign in</Link>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} UDD-SAGE</span>
          <span>United in purpose. Growing in excellence.</span>
        </div>
      </footer>
    </>
  );
}
