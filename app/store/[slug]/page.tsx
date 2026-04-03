import { createClient } from "@supabase/supabase-js";
import VoteButtons from "@/components/VoteButtons";
import UseCodeButton from "@/components/UseCodeButton";

// 🔥 SEO METADATA
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const name = params.slug;

  return {
    title: `${name} Promo Codes (2026) – Verified Discounts`,
    description: `Find the best ${name} promo codes, discount codes, and verified deals. Updated daily with real success rates.`,
  };
}

export default async function StorePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 🔹 Get store
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single();

  // 🔹 Get promos + votes
  const { data: promosData } = await supabase
    .from("promo_codes")
    .select(`
      *,
      promo_votes(vote_type)
    `)
    .eq("store_id", store.id);

  // 🔥 ADVANCED RANKING ENGINE
  const promos = (promosData || []).sort((a: any, b: any) => {
    const getScore = (promo: any) => {
      const worked =
        promo.promo_votes?.filter((v: any) => v.vote_type === "worked").length || 0;

      const failed =
        promo.promo_votes?.filter((v: any) => v.vote_type === "failed").length || 0;

      const total = worked + failed;
      const clicks = promo.click_count || 0;

      if (total === 0) return 0;

      const successRate = worked / total;
      const logVotes = Math.log10(total + 1);
      const logClicks = Math.log10(clicks + 1);

      return (
        successRate * 0.6 +
        logVotes * 0.25 +
        logClicks * 0.15
      );
    };

    return getScore(b) - getScore(a);
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 🔥 SEO CONTENT */}
      <h1 className="text-2xl font-bold mb-2">
        {store?.name} Promo Codes & Discounts
      </h1>

      <p className="text-gray-600 mb-6">
        Find the latest {store?.name} promo codes, verified discount codes, and exclusive deals. Updated with real user success rates.
      </p>

      <div className="space-y-6">
        {promos.map((promo: any, index: number) => {
          const worked =
            promo.promo_votes?.filter(
              (v: any) => v.vote_type === "worked"
            ).length || 0;

          const failed =
            promo.promo_votes?.filter(
              (v: any) => v.vote_type === "failed"
            ).length || 0;

          const totalVotes = worked + failed;

          const successRate =
            totalVotes === 0
              ? 0
              : Math.round((worked / totalVotes) * 100);

          const isTrusted = totalVotes >= 3;
          const isVerified = totalVotes >= 3 && successRate >= 70;
          const isTopCode = index === 0 && totalVotes >= 3;

          return (
            <div
              key={promo.id}
              className={`border p-4 rounded ${
                isTopCode ? "border-yellow-400 bg-yellow-50" : ""
              }`}
            >
              {/* 🏆 TOP CODE */}
              {isTopCode && (
                <p className="text-yellow-700 font-bold mb-2">
                  🏆 Top Code
                </p>
              )}

              <p>
                <strong>Code:</strong> {promo.code}
              </p>

              {/* 🔥 TRUST LABELS */}
              {isVerified ? (
                <p className="text-green-600 font-medium">
                  ✔ Verified Code
                </p>
              ) : isTrusted ? (
                <p className="text-orange-600 font-medium">
                  Community Rated
                </p>
              ) : (
                <p className="text-gray-500 font-medium">
                  New / Not enough votes yet
                </p>
              )}

              <p>Success rate: {successRate}%</p>

              <p className="text-sm text-gray-500">
                Votes: {totalVotes} · Worked: {worked} · Failed: {failed}
              </p>

              <p className="text-sm text-gray-500">
                Clicks: {promo.click_count || 0}
              </p>

              {/* 🚀 CTA */}
              <UseCodeButton
                code={promo.code}
                promoId={promo.id}
                url={promo.destination_url}
              />

              {/* 👍 VOTING */}
              <VoteButtons promoId={promo.id} />
            </div>
          );
        })}
      </div>

      {/* 🔥 SEO FOOTER */}
      <div className="mt-10 text-sm text-gray-600">
        <h2 className="font-semibold mb-2">
          About {store?.name} Promo Codes
        </h2>

        <p>
          We collect and verify the best {store?.name} promo codes to help you save money.
          Our system ranks codes based on real user success rates and popularity.
        </p>

        <p className="mt-2">
          New discounts are added daily, and expired codes are removed automatically.
        </p>
      </div>
    </div>
  );
}