import "./globals.css";
import type { Metadata } from "next";
import FingerprintInit from "../components/FingerprintInit";

// Offqira is the new public-facing brand and the attached production domain.
// The old Vercel URL remains usable; canonical marketing links prefer Offqira.
const siteUrl = "https://offqira.com";
const description =
  "Offqira is a UK-based promotional offers platform in development. Explore our product vision and progress toward verified merchant pilots.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Offqira | Better offers. Better discovery.",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Offqira | Better offers. Better discovery.",
    description,
    siteName: "Offqira",
    type: "website",
    url: siteUrl,
    locale: "en_GB",
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
        <FingerprintInit />
        {children}
      </body>
    </html>
  );
}
