"use server";

import { createClient } from "@/lib/supabase/server";

export async function approvePromo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("promo_codes")
    .update({ approved: true })
    .eq("id", id);

  if (error) {
    console.error("APPROVE ERROR:", error);
  }
}