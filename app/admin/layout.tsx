// app/admin/layout.tsx

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
export const dynamicParams = true;

export default function AdminLayout({ children }) {
  return <>{children}</>;
}
