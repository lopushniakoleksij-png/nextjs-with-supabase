import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: promos } = await supabase
    .from("promo_codes")
    .select("*")
    .limit(20);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {promos?.map((promo) => (
        <div key={promo.id} className="border p-3 mb-2">
          <p>{promo.code}</p>
        </div>
      ))}
    </div>
  );
}