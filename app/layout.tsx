import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import AuthButton from "@/components/auth-button"; // ✅ DEFAULT import
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Promo Platform",
  description: "Promo Platform MVP",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            {/* LEFT */}
            <Link href="/" className="text-lg font-semibold">
              Promo Platform
            </Link>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />

              {!hasEnvVars && <EnvVarWarning />}

              {user ? (
                <AuthButton />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="rounded-md bg-black px-3 py-2 text-sm text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

