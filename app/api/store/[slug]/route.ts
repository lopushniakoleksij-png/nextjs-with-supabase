import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, slug, name, website_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (storeError || !store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { data: promos, error: promoError } = await supabase
    .from("promo_codes")
    .select(
      "id, code, title, description, expires_at, click_count, worked_count, failed_count"
    )
    .eq("store_id", store.id)
    .eq("approved", true)
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (promoError) {
    return NextResponse.json({ error: promoError.message }, { status: 500 });
  }

  return NextResponse.json({ store, promos: promos || [] });
}
