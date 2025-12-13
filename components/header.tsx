import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          Promo Platform
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}

