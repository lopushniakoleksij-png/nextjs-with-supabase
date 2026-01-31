"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusSquare,
  Tags,
  Store,
} from "lucide-react";

const navigation = [
  {
    label: "Main",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Promo management",
    items: [
      {
        name: "Add promo code",
        href: "/dashboard/add",
        icon: PlusSquare,
      },
      {
        name: "Promo codes",
        href: "/dashboard/promos",
        icon: Tags,
      },
      {
        name: "Stores",
        href: "/dashboard/stores",
        icon: Store,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white px-4 py-6">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-lg font-semibold text-gray-900">
          Promo Platform
        </h1>
        <p className="text-xs text-gray-500">
          Admin dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {navigation.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {section.label}
            </p>

            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
                        ${
                          active
                            ? "bg-indigo-50 text-indigo-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
