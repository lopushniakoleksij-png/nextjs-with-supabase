import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && (
          <div className="rounded-md bg-indigo-50 p-2 text-indigo-600">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 text-2xl font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
