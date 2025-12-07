// app/admin/layout.tsx
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const runtime = "nodejs";  // 🔥 required
export const preferredRegion = "auto";

export default function AdminLayout({ children }) {
  return <>{children}</>;
}
