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
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p>Total</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{totalCount || 0}</p>
        </div>

        <div className="min-w-0 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p>Pending</p>
          <p className="text-xl font-bold">{pendingCount || 0}</p>
        </div>

        <div className="min-w-0 rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
          <p>Approved</p>
          <p className="text-xl font-bold">{approvedCount || 0}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold leading-tight sm:text-3xl">Pending Promo Codes</h1>

      {promoCodes.length === 0 ? (
        <p>No pending promo codes.</p>
      ) : (
        <div className="space-y-4">
          {promoCodes.map((promo) => {
            const store = Array.isArray(promo.stores)
              ? promo.stores[0]
              : promo.stores;

            return (
              <div key={promo.id} className="min-w-0 rounded-xl border border-slate-200 bg-white p-4">
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

                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={approvePromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button className="min-h-11 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white">
                      Approve
                    </button>
                  </form>

                  <form action={rejectPromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button className="min-h-11 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950">
                      Reject
                    </button>
                  </form>

                  <form action={deletePromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button className="min-h-11 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white">
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
