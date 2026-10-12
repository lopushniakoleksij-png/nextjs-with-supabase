import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import Sidebar from "@/components/sidebar";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <main className="min-w-0 w-full flex-1 px-4 py-6 sm:px-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
