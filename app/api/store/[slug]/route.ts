import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {

  const supabase = await createClient()

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", params.slug)
    .single()

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 })
  }

  const { data: promos } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("store", store.id)
    .order("ranking_score", { ascending: false })
    .limit(50)

  return NextResponse.json({
    store,
    promos
  })
}