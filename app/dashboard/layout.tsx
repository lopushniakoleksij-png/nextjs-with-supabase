import Sidebar from "@/components/sidebar";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-gray-50 md:flex-row">
      <Sidebar />
      <main className="min-w-0 w-full flex-1 px-4 py-6 sm:px-6 lg:p-8">{children}</main>
    </div>
  );
}
