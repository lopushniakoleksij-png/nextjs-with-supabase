import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { promoId, voteType, fingerprint } = await req.json();

    if (!promoId || !voteType || !fingerprint) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Server-side Supabase client (NO NEXT_PUBLIC)
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 🔹 Insert vote (ignore duplicates)
    const { error: insertError } = await supabase
      .from("promo_votes")
      .insert([
        {
          promo_id: promoId,
          vote_type: voteType,
          fingerprint: fingerprint,
        },
      ]);

    // Ignore duplicate error (user already voted)
    if (insertError && insertError.code !== "23505") {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // 🔹 Get updated stats
    const { data: stats, error: statsError } = await supabase
      .from("promo_votes")
      .select("vote_type")
      .eq("promo_id", promoId);

    if (statsError) {
      return NextResponse.json(
        { error: statsError.message },
        { status: 500 }
      );
    }

    const worked = stats.filter((v) => v.vote_type === "worked").length;
    const failed = stats.filter((v) => v.vote_type === "failed").length;

    const successRate =
      worked + failed === 0
        ? 0
        : Math.round((worked / (worked + failed)) * 100);

    return NextResponse.json({
      successRate,
      worked,
      failed,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}