import "./globals.css";
import type { Metadata } from "next";
import FingerprintInit from "../components/FingerprintInit";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://nextjs-with-supabase-neon-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Promo Code 4 | UK Deals & Discount Codes",
    template: "%s | Promo Code 4",
  },
  description: "Discover approved UK promotional offers, compare community feedback and save deals for later.",
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
