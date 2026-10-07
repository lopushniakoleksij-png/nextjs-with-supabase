import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";

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
  return <>{children}</>;
}
