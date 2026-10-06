import { NextResponse } from "next/server";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const promoId = String(body?.promoId || "");
    const voteType = body?.voteType;
    const fingerprint = String(body?.fingerprint || "");

    if (
      !UUID_PATTERN.test(promoId) ||
      !["worked", "failed"].includes(voteType) ||
      fingerprint.length < 8 ||
      fingerprint.length > 200
    ) {
      return NextResponse.json({ error: "Invalid vote payload" }, { status: 400 });
    }

    const supabase = createPublicServerClient();
    const { data, error } = await supabase.rpc("record_promo_vote", {
      p_promo_id: promoId,
      p_vote_type: voteType,
      p_fingerprint: fingerprint,
    });

    if (error) {
      const status = error.message.includes("promo not available") ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    const stats = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      successRate: stats?.success_rate ?? 0,
      worked: stats?.worked ?? 0,
      failed: stats?.failed ?? 0,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
