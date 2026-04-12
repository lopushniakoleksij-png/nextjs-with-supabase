import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient(); // ✅ FIX HERE

    const { data, error } = await supabase
      .from("promo_codes")
      .select("destination_url")
      .eq("id", params.id)
      .single();

    if (error || !data?.destination_url) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.redirect(data.destination_url);
  } catch (err) {
    console.error("Redirect error:", err);
    return NextResponse.redirect(new URL("/", req.url));
  }
}