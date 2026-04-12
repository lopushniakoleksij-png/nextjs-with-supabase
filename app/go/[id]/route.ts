import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const supabase = await createClient()

  const id = context.params.id

  const { data } = await supabase
    .from("promo_codes")
    .select("destination_url")
    .eq("id", id)
    .single()

  if (!data?.destination_url) {
    redirect("https://google.com")
  }

  redirect(data.destination_url)
}