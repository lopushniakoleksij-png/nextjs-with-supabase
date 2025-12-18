import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import AuthButton from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";

export default function Page() {
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

      <main className="flex-1 flex flex-col gap-6 px-4">
        <Hero />
        <ConnectSupabaseSteps />
      </main>
    </>
  );
}
