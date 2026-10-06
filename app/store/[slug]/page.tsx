import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import VoteButtons from "@/components/VoteButtons";
import UseCodeButton from "@/components/UseCodeButton";

type StoreRow = {
  id: string;
  slug: string;
  name: string;
};

type PromoRow = {
  id: string;
  code: string;
  title: string | null;
  description: string | null;
  expires_at: string | null;
  click_count: number | null;
  worked_count: number | null;
  failed_count: number | null;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const displayName = slug.replace(/-/g, " ");

  return {
    title: `${displayName} Promo Codes – Verified Discounts`,
    description: `Find active ${displayName} promo codes, discount codes, and community-rated deals.`,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, slug, name")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<StoreRow>();

  if (storeError || !store) {
    notFound();
  }

  const now = new Date().toISOString();

  const { data: promosData, error: promosError } = await supabase
    .from("promo_codes")
    .select(
      "id, code, title, description, expires_at, click_count, worked_count, failed_count"
    )
    .eq("store_id", store.id)
    .eq("approved", true)
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (promosError) {
    throw new Error(promosError.message);
  }

  const promos = ((promosData || []) as PromoRow[]).sort((a, b) => {
    const score = (promo: PromoRow) => {
      const worked = promo.worked_count || 0;
      const failed = promo.failed_count || 0;
      const total = worked + failed;
      const clicks = promo.click_count || 0;

      if (total === 0) return Math.log10(clicks + 1) * 0.15;

      const successRate = worked / total;
      const logVotes = Math.log10(total + 1);
      const logClicks = Math.log10(clicks + 1);

      return successRate * 0.6 + logVotes * 0.25 + logClicks * 0.15;
    };

    return score(b) - score(a);
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        {store.name} Promo Codes & Discounts
      </h1>

      <p className="text-gray-600 mb-6">
        Active {store.name} discount codes ranked using community success
        rates and popularity.
      </p>

      {promos.length === 0 ? (
        <div className="border rounded p-5 text-gray-600">
          No verified {store.name} promo codes are available right now.
        </div>
      ) : (
        <div className="space-y-6">
          {promos.map((promo, index) => {
            const worked = promo.worked_count || 0;
            const failed = promo.failed_count || 0;
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
                {isTopCode && (
                  <p className="text-yellow-700 font-bold mb-2">Top Code</p>
                )}

                {promo.title && (
                  <h2 className="font-semibold mb-1">{promo.title}</h2>
                )}

                <p>
                  <strong>Code:</strong> {promo.code}
                </p>

                {promo.description && (
                  <p className="text-gray-600 mt-1">{promo.description}</p>
                )}

                {isVerified ? (
                  <p className="text-green-600 font-medium mt-2">
                    Verified Code
                  </p>
                ) : isTrusted ? (
                  <p className="text-orange-600 font-medium mt-2">
                    Community Rated
                  </p>
                ) : (
                  <p className="text-gray-500 font-medium mt-2">
                    New / not enough votes yet
                  </p>
                )}

                <p>Success rate: {successRate}%</p>

                <p className="text-sm text-gray-500">
                  Votes: {totalVotes} · Worked: {worked} · Failed: {failed}
                </p>

                <p className="text-sm text-gray-500">
                  Clicks: {promo.click_count || 0}
                </p>

                {promo.expires_at && (
                  <p className="text-sm text-gray-500">
                    Expires: {new Date(promo.expires_at).toLocaleDateString("en-GB")}
                  </p>
                )}

                <UseCodeButton code={promo.code} promoId={promo.id} />
                <VoteButtons promoId={promo.id} />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 text-sm text-gray-600">
        <h2 className="font-semibold mb-2">
          About {store.name} Promo Codes
        </h2>
        <p>
          Codes are shown only while active and approved. Community feedback
          helps rank the most reliable offers first.
        </p>
      </div>
    </div>
  );
}
