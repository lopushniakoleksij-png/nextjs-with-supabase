import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "@/app/globals.css"

import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Next.js + Supabase",
  description: "Starter with shadcn/ui toast",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

        {/* ✅ THIS IS REQUIRED */}
        <Toaster />
      </body>
    </html>
  )
}

