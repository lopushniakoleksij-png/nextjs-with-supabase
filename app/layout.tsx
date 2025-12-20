import "./globals.css";
import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";

export const metadata: Metadata = {
  title: "Promo Platform",
  description: "Promo codes platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}

