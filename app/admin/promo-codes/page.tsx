import { createClient } from "@/lib/supabase/server";
import { togglePromoCode, deletePromoCode } from "@/app/actions/promo-codes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PromoRow = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  approved: boolean;
  is_active: boolean;
  stores:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

export default async function PromoCodesAdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promo_codes")
    .select(
      "id, code, title, description, approved, is_active, stores(name, slug)"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const codes = (data || []) as PromoRow[];

  return (
    <div className="space-y-4">
      {codes.length === 0 ? (
        <p>No promo codes yet.</p>
      ) : (
        codes.map((promo) => {
          const store = Array.isArray(promo.stores)
            ? promo.stores[0]
            : promo.stores;

          return (
            <Card key={promo.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">
                    {store?.name || store?.slug || "Store"} · {promo.code}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {promo.title || promo.description || "No description"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {promo.approved ? "Approved" : "Pending"} ·{" "}
                    {promo.is_active ? "Active" : "Disabled"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await togglePromoCode(promo.id, promo.is_active);
                    }}
                  >
                    <Button variant="outline" type="submit">
                      {promo.is_active ? "Disable" : "Enable"}
                    </Button>
                  </form>

                  <form
                    action={async () => {
                      "use server";
                      await deletePromoCode(promo.id);
                    }}
                  >
                    <Button variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
