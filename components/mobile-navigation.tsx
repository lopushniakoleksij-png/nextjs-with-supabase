"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Store, UserRound } from "lucide-react";

const tabs = [
  { href: "/", label: "Deals", icon: Compass, matches: (path: string) => path === "/" },
  { href: "/stores", label: "Stores", icon: Store, matches: (path: string) => path === "/stores" || path.startsWith("/store/") },
  { href: "/saved", label: "Saved", icon: Bookmark, matches: (path: string) => path === "/saved" },
  { href: "/auth/login", label: "Account", icon: UserRound, matches: (path: string) => path.startsWith("/auth/") },
];

export default function MobileNavigation() {
  const pathname = usePathname() || "/";
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_28px_rgba(15,23,42,0.06)] backdrop-blur md:hidden"
    >
      {tabs.map(({ href, label, icon: Icon, matches }) => {
        const active = matches(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              "flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1 px-1 text-center focus-visible:outline-2 focus-visible:outline-[#7055df] " +
              (active ? "text-[#5d3dc8]" : "text-slate-600 hover:text-[#5d3dc8]")
            }
          >
            <Icon size={21} aria-hidden="true" />
            <span className={"text-[11px] " + (active ? "font-extrabold" : "font-semibold")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
