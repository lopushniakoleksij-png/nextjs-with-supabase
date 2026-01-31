import { createClient } from "@/lib/supabase/server"

export default async function CheckPromoCodesPage() {
  const supabase = await createClient()

  const { data: codes } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Verified Promo Codes</h1>

      {codes?.map((c) => (
        <div
          key={c.id}
          className="border rounded-lg p-4 flex justify-between"
        >
          <div>
            <p className="font-semibold">{c.store_name}</p>
            <p className="text-sm text-muted-foreground">
              {c.discount_description}
            </p>
          </div>

          <a
            href={c.link}
            target="_blank"
            className="text-blue-600 underline"
          >
            Use code
          </a>
        </div>
      ))}
    </div>
  )
}
