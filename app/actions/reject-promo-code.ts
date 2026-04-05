"use server";

import { createClient } from "@/lib/supabase/server";

export async function rejectPromo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("promo_codes")
    .update({ approved: false })
    .eq("id", id);

  if (error) {
    console.error("REJECT ERROR:", error);
  }
}