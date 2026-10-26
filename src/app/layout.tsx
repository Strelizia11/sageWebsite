import type { Metadata } from "next";
import "./globals.css";
import "./academic.css";
import { FULL_NAME } from "@/lib/domain";
import localFont from "next/font/local";
const bodyFont = localFont({
  src: [
    { path: "../../public/fonts/dm-sans-400.ttf", weight: "400" },
    { path: "../../public/fonts/dm-sans-500.ttf", weight: "500" },
    { path: "../../public/fonts/dm-sans-600.ttf", weight: "600" },
    { path: "../../public/fonts/dm-sans-700.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});
const headingFont = localFont({
  src: [
    { path: "../../public/fonts/manrope-400.ttf", weight: "400" },
    { path: "../../public/fonts/manrope-500.ttf", weight: "500" },
    { path: "../../public/fonts/manrope-600.ttf", weight: "600" },
    { path: "../../public/fonts/manrope-700.ttf", weight: "700" },
    { path: "../../public/fonts/manrope-800.ttf", weight: "800" },
  ],
  variable: "--font-heading",
  display: "swap",
  preload: false,
});
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
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
