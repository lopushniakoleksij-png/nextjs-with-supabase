import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient() // ✅ IMPORTANT

  const { data, error } = await supabase
    .from("promo_codes")
    .select("destination_url")
    .eq("id", params.id)
    .single()

  if (error || !data) {
    return NextResponse.redirect("https://google.com")
  }

  return NextResponse.redirect(data.destination_url)
}