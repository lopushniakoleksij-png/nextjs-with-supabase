import { requireAdmin } from "@/lib/auth/requireAdmin"
await requireAdmin()
import { createClient } from "@/lib/supabase/server"
import { togglePromoCode, deletePromoCode } from "@/app/actions/promo-codes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function PromoCodesAdminPage() {
  const supabase = await createClient()

  const { data: codes } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      {codes?.map((c) => (
        <Card key={c.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{c.store_name}</p>
              <p className="text-sm text-muted-foreground">
                {c.discount_description}
              </p>
            </div>

            <div className="flex gap-2">
              <form
                action={async () => {
                  "use server"
                  await togglePromoCode(c.id, c.is_active)
                }}
              >
                <Button variant="outline" type="submit">
                  {c.is_active ? "Disable" : "Enable"}
                </Button>
              </form>

              <form
                action={async () => {
                  "use server"
                  await deletePromoCode(c.id)
                }}
              >
                <Button variant="destructive" type="submit">
                  Delete
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
