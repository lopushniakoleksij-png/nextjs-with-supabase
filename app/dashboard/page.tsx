import { StatCard } from "@/components/dashboard/stat-card";
import { Tags, Store, Eye } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Welcome 👋
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Promo codes"
          value="—"
          icon={<Tags className="h-5 w-5" />}
        />
        <StatCard
          title="Stores"
          value="—"
          icon={<Store className="h-5 w-5" />}
        />
        <StatCard
          title="Views"
          value="—"
          icon={<Eye className="h-5 w-5" />}
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Quick actions
        </h2>

        <div className="flex flex-col gap-2 text-sm">
          <a
            href="/dashboard/add"
            className="text-indigo-600 hover:underline"
          >
            Add promo code
          </a>
          <a
            href="/dashboard/promos"
            className="text-indigo-600 hover:underline"
          >
            View promo codes
          </a>
          <a
            href="/dashboard/stores"
            className="text-indigo-600 hover:underline"
          >
            Manage stores
          </a>
        </div>
      </div>
    </div>
  );
}
