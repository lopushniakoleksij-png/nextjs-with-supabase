import { NextResponse } from "next/server";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const requestUrl = new URL(req.url);
  const fingerprint = requestUrl.searchParams.get("fp");

  const supabase = createPublicServerClient();
  const { data: destination, error } = await supabase.rpc(
    "record_promo_click",
    {
      p_promo_id: id,
      p_fingerprint: fingerprint,
    }
  );

  if (error || !destination) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const target = new URL(destination);
    if (!["http:", "https:"].includes(target.protocol)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.redirect(target);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
