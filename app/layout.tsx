import "./globals.css";
import type { Metadata } from "next";
import FingerprintInit from "../components/FingerprintInit"; // ✅ FIXED

export const metadata: Metadata = {
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