import "./globals.css";
import { ReactNode } from "react";
import { ToastProvider } from "@/app/providers/ToastProvider";

export const metadata = {
  title: "Promo Platform",
  description: "Promo codes platform MVP",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

