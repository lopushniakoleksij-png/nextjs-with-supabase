import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: {
    store_slug: string;
  };
};

type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  expires_at: string | null;
};

export default async function PromoCodesByStorePage({ params }: PageProps) {
  const supabase = await createClient(); // ✅ await fixed

  const { data: promos, error } = await supabase
    .from("promo_codes")
    .select("id, code, description, expires_at")
    .eq("store_slug", params.store_slug)
    .eq("is_verified", true);

  if (error) {
    console.error(error);
    return <div>Error loading promo codes</div>;
  }

  if (!promos || promos.length === 0) {
    return <div>No promo codes found for this store.</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        Promo codes for {params.store_slug}
      </h1>

      <ul className="space-y-3">
        {promos.map((promo: PromoCode) => (
          <li key={promo.id} className="border p-3 rounded">
            <strong>{promo.code}</strong>
            {promo.description && <p>{promo.description}</p>}
            {promo.expires_at && (
              <small>Expires: {new Date(promo.expires_at).toDateString()}</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
