import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Bookmark,
  Compass,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Promo Code 4 homepage">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#211b57] text-[#c9fa7a]">
            <BadgePercent size={23} aria-hidden="true" />
          </span>
          <span className="text-xl font-black tracking-[-0.065em]">
            promo<span className="text-[#6944ea]">code</span><span className="ml-0.5 text-[#10182b]">4</span>
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/#offers" className="hover:text-[#5937d5]">Deals</Link>
          <Link href="/stores" className="hover:text-[#5937d5]">Stores</Link>
          <Link href="/saved" className="hover:text-[#5937d5]">Saved deals</Link>
          <Link href="/about" className="hover:text-[#5937d5]">How it works</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex">
            Log in
          </Link>
          <Link href="/auth/sign-up" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#211b57] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3e2f91]">
            Get started <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-5 py-9 text-sm text-slate-500 sm:flex-row sm:items-center sm:px-8">
        <Link href="/" className="font-extrabold text-[#211b57]">promocode4</Link>
        <p className="max-w-lg text-xs leading-5">
          Offers and retailer terms may change. We may receive a commission from eligible links; it never changes your price.
        </p>
        <Link href="/about" className="shrink-0 text-xs font-semibold hover:text-[#6844db]">About &amp; disclosures</Link>
      </div>
    </footer>
  );
}

export function MobileNavigation() {
  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_28px_rgba(15,23,42,0.06)] backdrop-blur md:hidden">
      <Link href="/#offers" className="flex min-h-[68px] flex-col items-center justify-center gap-1 text-[#5d3dc8] focus-visible:outline-2 focus-visible:outline-[#7055df]">
        <Compass size={21} aria-hidden="true" /><span className="text-[11px] font-bold">Deals</span>
      </Link>
      <Link href="/stores" className="flex min-h-[68px] flex-col items-center justify-center gap-1 text-slate-600 focus-visible:outline-2 focus-visible:outline-[#7055df]">
        <Store size={21} aria-hidden="true"/><span className="text-[11px] font-semibold">Stores</span>
      </Link>
      <Link href="/saved" className="flex min-h-[68px] flex-col items-center justify-center gap-1 text-slate-600 focus-visible:outline-2 focus-visible:outline-[#7055df]">
        <Bookmark size={21} aria-hidden="true"/><span className="text-[11px] font-semibold">Saved</span>
      </Link>
      <Link href="/auth/login" className="flex min-h-[68px] flex-col items-center justify-center gap-1 text-slate-600 focus-visible:outline-2 focus-visible:outline-[#7055df]">
        <UserRound size={21} aria-hidden="true"/><span className="text-[11px] font-semibold">Account</span>
      </Link>
    </nav>
  );
}

export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-[84px] text-[#10182b] md:pb-0">
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <MobileNavigation />
    </div>
  );
}
