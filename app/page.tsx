import { createClient } from "@/lib/supabase/server";

type PromoRow = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  stores:
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: promoCodes, error } = await supabase
    .from("promo_codes")
    .select("id, code, title, description, expires_at, stores(name, slug)")
    .eq("approved", true)
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("expires_at", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  const promos = (promoCodes || []) as PromoRow[];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Verified UK Promo Codes & Deals
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Active offers with community success signals.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {promos.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">
              No verified promo codes available right now.
            </p>
          </div>
        ) : (
          promos.map((promo) => {
            const store = Array.isArray(promo.stores)
              ? promo.stores[0]
              : promo.stores;

            return (
              <div
                key={promo.id}
                className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">
                    {store?.name || "Store"}
                  </h2>

                  {promo.expires_at && (
                    <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                      Expires:{" "}
                      {new Date(promo.expires_at).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>

                {promo.title && (
                  <p className="font-medium mb-1">{promo.title}</p>
                )}

                {promo.description && (
                  <p className="text-gray-600 mb-4">{promo.description}</p>
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-lg">
                    {promo.code}
                  </div>

                  <a
                    href={`/go/${promo.id}`}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    Use Deal
                  </a>
                </div>

                {store?.slug && (
                  <a
                    href={`/store/${store.slug}`}
                    className="inline-block mt-3 text-sm underline"
                  >
                    View all {store.name} offers
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
