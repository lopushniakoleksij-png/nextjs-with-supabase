import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("promo_codes")
    .select("destination_url")
    .eq("id", params.id)
    .single()

  if (!data?.destination_url) {
    return NextResponse.redirect("https://google.com")
  }

  return NextResponse.redirect(data.destination_url)
}