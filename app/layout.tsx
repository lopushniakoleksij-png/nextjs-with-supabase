import "./globals.css";
import type { Metadata } from "next";
import FingerprintInit from "../components/FingerprintInit";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://nextjs-with-supabase-neon-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Promo Code Platform",
  description: "Find verified promo codes and deals",
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
