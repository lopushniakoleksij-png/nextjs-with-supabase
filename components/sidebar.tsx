"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/promo-codes", label: "Promo Codes" },
  { href: "/admin/merchants", label: "Merchant Reviews" },
  { href: "/dashboard/add", label: "Add Promo" },
  { href: "/", label: "View Website" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function renderLinks() {
    return links.map(({ href, label }) => {
      const active =
        href !== "/" &&
        (pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)));

      return (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={() => setMenuOpen(false)}
          className={`block rounded-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            active
              ? "bg-indigo-50 text-indigo-800"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
          }`}
        >
          {label}
        </Link>
      );
    });
  }

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white md:hidden">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4">
          <span className="text-lg font-bold text-slate-900">Promo Code 4 Admin</span>
          <button
            type="button"
            aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-300 text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        <nav
          id="admin-mobile-navigation"
          aria-label="Mobile admin navigation"
          hidden={!menuOpen}
          className={menuOpen ? "border-t border-slate-200 px-3 pb-3 pt-2" : "hidden"}
        >
          {renderLinks()}
        </nav>
      </div>

      <aside className="hidden min-h-screen w-56 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block lg:w-64">
        <h2 className="mb-6 px-3 text-xl font-bold text-slate-900">Admin Panel</h2>
        <nav aria-label="Admin navigation" className="space-y-1">
          {renderLinks()}
        </nav>
      </aside>
    </>
  );
}
