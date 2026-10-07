import { requireAdmin } from "@/lib/auth/requireAdmin";
import { approvePromo } from "@/app/actions/approve-promo-code";
import { rejectPromo } from "@/app/actions/reject-promo-code";

type PromoCodeRow = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  approved: boolean;
  is_active: boolean;
  created_at: string;
  stores:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

export const dynamic = "force-dynamic";

export default async function PromoCodesPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("promo_codes")
    .select(
      "id, code, title, description, expires_at, approved, is_active, created_at, stores(name, slug)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const promos = (data ?? []) as PromoCodeRow[];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Promo Codes</h1>

      {promos.length === 0 ? (
        <div className="border rounded p-4 text-gray-600">
          No promo codes yet.
        </div>
      ) : (
        <div className="space-y-4">
          {promos.map((promo) => {
            const store = Array.isArray(promo.stores)
              ? promo.stores[0]
              : promo.stores;
            const status = promo.approved
              ? promo.is_active
                ? "Approved"
                : "Disabled"
              : "Pending";

            return (
              <div
                key={promo.id}
                className="border rounded p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    Store:{" "}
                    <span className="font-medium">
                      {store?.name || store?.slug || "Store"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Code: <span className="font-medium">{promo.code}</span>
                  </div>

                  <div className="text-sm">
                    Status: <span className="font-medium">{status}</span>
                  </div>

                  {promo.title && (
                    <div className="text-sm font-medium">{promo.title}</div>
                  )}

                  {promo.description && (
                    <div className="text-sm text-gray-600">
                      {promo.description}
                    </div>
                  )}

                  {promo.expires_at && (
                    <div className="text-sm text-gray-500">
                      Expires:{" "}
                      {new Date(promo.expires_at).toLocaleDateString("en-GB")}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <form action={approvePromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={promo.approved && promo.is_active}
                    >
                      Approve
                    </button>
                  </form>

                  <form action={rejectPromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
