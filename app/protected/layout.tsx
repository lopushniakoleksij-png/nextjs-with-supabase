import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="flex w-full justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <span>Promo Platform</span>
            <DeployButton />
          </div>

          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <EnvVarWarning />
            <AuthButton />
          </div>
        </div>
      </nav>

      <main className="w-full max-w-6xl mx-auto p-4">{children}</main>
    </>
  );
}

