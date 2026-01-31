import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
};

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {value}
          </p>
        </div>

        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
