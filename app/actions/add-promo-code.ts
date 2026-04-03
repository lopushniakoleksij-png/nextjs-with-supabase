"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function addPromoCode(formData: FormData) {
  const supabase = await createClient();

  const promo_code = formData.get("code") as string;
  const brand_name = formData.get("store_slug") as string;
  const discount_description = formData.get("description") as string | null;
  const expiry_date = formData.get("expires_at") as string | null;

  if (!promo_code || !brand_name) return;

  const { error } = await supabase.from("promo_codes").insert({
    promo_code,
    brand_name,
    discount_description,
    expiry_date: expiry_date || null,
  });

  if (error) {
    console.error("INSERT ERROR:", error);
    return;
  }

  redirect("/dashboard");
}