import { createClient } from "@/lib/supabase/server";
import { approvePromo } from "@/app/actions/approve-promo-code";
import { rejectPromo } from "@/app/actions/reject-promo-code";

type PromoCodeRow = {
  id: string;
  code: string;
  store_slug: string;
  description: string | null;
  expires_at: string | null;
  approved: boolean;
  created_at: string;
};

export default async function PromoCodesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Promo Codes</h1>
        <p className="mt-2">You are not logged in.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .select(
      "id, code, store_slug, description, expires_at, approved, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Promo Codes</h1>
        <p className="mt-2 text-red-600">DB error: {error.message}</p>
      </div>
    );
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
            const status = promo.approved ? "Approved" : "Pending";

            return (
              <div
                key={promo.id}
                className="border rounded p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    Store:{" "}
                    <span className="font-medium">
                      {promo.store_slug}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Code:{" "}
                    <span className="font-medium">{promo.code}</span>
                  </div>

                  <div className="text-sm">
                    Status:{" "}
                    <span
                      className={
                        promo.approved
                          ? "text-green-700 font-medium"
                          : "text-orange-600 font-medium"
                      }
                    >
                      {status}
                    </span>
                  </div>

                  {promo.description && (
                    <div className="text-sm text-gray-600">
                      {promo.description}
                    </div>
                  )}

                  {promo.expires_at && (
                    <div className="text-sm text-gray-500">
                      Expires: {promo.expires_at}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* ✅ APPROVE */}
                  <form action={approvePromo}>
                    <input type="hidden" name="id" value={promo.id} />
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={promo.approved}
                    >
                      Approve
                    </button>
                  </form>

                  {/* ✅ REJECT */}
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