import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

      <nav className="flex flex-col gap-4">
        <Link href="/dashboard" className="hover:text-blue-600 font-medium">
          Dashboard
        </Link>

        <Link href="/admin/stores" className="hover:text-blue-600 font-medium">
          Stores
        </Link>

        <Link href="/admin/promo-codes" className="hover:text-blue-600 font-medium">
          Promo Codes
        </Link>

        <Link href="/dashboard/add" className="hover:text-blue-600 font-medium">
          Add Promo
        </Link>

        <Link href="/" className="hover:text-blue-600 font-medium">
          View Website
        </Link>
      </nav>
    </aside>
  );
}
