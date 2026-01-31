"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Promo = {
  id: string;
  code: string;
  discount: string;
  active: boolean;
  expires_at: string | null;
  store_name: string;
};

export default function PromoCodesPage() {
  const supabase = createClient();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromos = async () => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("id, code, discount, active, expires_at, store_name")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPromos(data);
      }

      setLoading(false);
    };

    loadPromos();
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Loading promo codes…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Promo codes</h1>
        <p className="text-sm text-muted-foreground">
          Manage all promo codes on the platform
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {promos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  No promo codes found
                </TableCell>
              </TableRow>
            )}

            {promos.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-mono">{promo.code}</TableCell>
                <TableCell>{promo.store_name}</TableCell>
                <TableCell>{promo.discount}</TableCell>
                <TableCell>
                  {promo.active ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {promo.expires_at
                    ? new Date(promo.expires_at).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
