import type { Metadata } from "next";
import "./globals.css";
import { FULL_NAME } from "@/lib/domain";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "UDD-SAGE — Scholars for greater excellence",
    template: "%s | UDD-SAGE",
  },
  description: FULL_NAME,
  openGraph: {
    title: "UDD-SAGE",
    description: FULL_NAME,
    images: ["/udd-sage-logo.png"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
