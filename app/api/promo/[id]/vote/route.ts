import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

type VoteBody = {
  voteType: "works" | "fail"
}

function buildFingerprint(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-ip"

  const userAgent = request.headers.get("user-agent") || "unknown-ua"

  return crypto
    .createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex")
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient()
  const body = (await request.json()) as VoteBody

  if (body.voteType !== "works" && body.voteType !== "fail") {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fingerprint = buildFingerprint(request)
  const promoId = params.id

  if (user) {
    const { error: upsertError } = await supabase
      .from("promo_votes")
      .upsert(
        {
          promo_id: promoId,
          user_id: user.id,
          vote_type: body.voteType,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "promo_id,user_id",
        }
      )

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }
  } else {
    const { error: upsertError } = await supabase
      .from("promo_votes")
      .upsert(
        {
          promo_id: promoId,
          fingerprint,
          vote_type: body.voteType,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "promo_id,fingerprint",
        }
      )

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }
  }

  const { data: votes, error: votesError } = await supabase
    .from("promo_votes")
    .select("vote_type")
    .eq("promo_id", promoId)

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 })
  }

  const worksCount = votes.filter((v) => v.vote_type === "works").length
  const failCount = votes.filter((v) => v.vote_type === "fail").length

  const { error: updateError } = await supabase
    .from("promo_codes")
    .update({
      works_count: worksCount,
      fail_count: failCount,
    })
    .eq("id", promoId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    worksCount,
    failCount,
  })
}