import { requireAdmin } from "@/lib/auth/requireAdmin";
import { approvePromo } from "@/app/actions/approve-promo-code";
import { rejectPromo } from "@/app/actions/reject-promo-code";
import { deletePromo } from "@/app/actions/delete-promo-code";

type PromoRow = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  approved: boolean;
  is_active: boolean;
  stores:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ count: totalCount }, { count: pendingCount }, { count: approvedCount }] =
    await Promise.all([
      supabase.from("promo_codes").select("id", { count: "exact", head: true }),
      supabase
        .from("promo_codes")
        .select("id", { count: "exact", head: true })
        .eq("approved", false),
      supabase
        .from("promo_codes")
        .select("id", { count: "exact", head: true })
        .eq("approved", true),
    ]);

  const { data, error } = await supabase
    .from("promo_codes")
    .select(
      "id, code, title, description, expires_at, approved, is_active, stores(name, slug)"
    )
    .eq("approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const promoCodes = (data || []) as PromoRow[];

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p>Total</p>
          <p className="text-xl font-bold">{totalCount || 0}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded shadow">
          <p>Pending</p>
          <p className="text-xl font-bold">{pendingCount || 0}</p>
        </div>

        <div className="bg-green-50 p-4 rounded shadow">
          <p>Approved</p>
          <p className="text-xl font-bold">{approvedCount || 0}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Pending Promo Codes</h1>

      {promoCodes.length === 0 ? (
        <p>No pending promo codes.</p>
      ) : (
        <div className="space-y-4">
          {promoCodes.map((promo) => {
            const store = Array.isArray(promo.stores)
              ? promo.stores[0]
              : promo.stores;

            return (
              <div key={promo.id} className="border p-4 rounded bg-white">
                <h2 className="font-semibold">
                  {store?.name || store?.slug || "Store"}
                </h2>

                <p>
                  Code: <strong>{promo.code}</strong>
                </p>

                {promo.title && <p className="font-medium">{promo.title}</p>}
                {promo.description && (
                  <p className="text-sm text-gray-600">{promo.description}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <form action={approvePromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button className="bg-green-600 text-white px-3 py-1 rounded">
                      Approve
                    </button>
                  </form>

                  <form action={rejectPromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded">
                      Reject
                    </button>
                  </form>

                  <form action={deletePromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button className="bg-red-600 text-white px-3 py-1 rounded">
                      Delete
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
