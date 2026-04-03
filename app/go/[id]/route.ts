import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const promoId = params.id;

  const { data: promo } = await supabase
    .from("promo_codes")
    .select("id, affiliate_url, click_count")
    .eq("id", promoId)
    .single();

  if (!promo) {
    return NextResponse.redirect("https://google.com");
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";

  await supabase.from("promo_clicks").insert({
    promo_id: promoId,
    ip,
    user_agent: userAgent,
  });

  await supabase
    .from("promo_codes")
    .update({
      click_count: (promo.click_count || 0) + 1,
    })
    .eq("id", promoId);

  return NextResponse.redirect(promo.affiliate_url);
}
