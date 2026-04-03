import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: promoCodes } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("approved", true)
    .order("expires_at", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      {/* HERO SECTION */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Verified UK Promo Codes & Deals
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Manually reviewed & verified. Updated daily.
        </p>

        <div className="bg-white p-4 rounded-lg shadow inline-block">
          <p className="text-sm text-gray-500">
            Trusted by smart shoppers saving every day 💰
          </p>
        </div>
      </div>

      {/* PROMO LIST */}
      <div className="max-w-4xl mx-auto space-y-6">
        {!promoCodes || promoCodes.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500">
              No verified promo codes available right now.
            </p>
          </div>
        ) : (
          promoCodes.map((code) => (
            <div
              key={code.id}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold capitalize">
                  {code.store_slug}
                </h2>

                {code.expires_at && (
                  <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                    Expires: {code.expires_at}
                  </span>
                )}
              </div>

              {code.description && (
                <p className="text-gray-600 mb-4">
                  {code.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-lg">
                  {code.code}
                </div>

                <a
  href={`/go/${code.id}`}
  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
>
  Use Deal
</a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}