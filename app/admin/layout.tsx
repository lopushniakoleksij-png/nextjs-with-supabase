// app/admin/layout.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const dynamicParams = true;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
