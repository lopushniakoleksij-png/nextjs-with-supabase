"use server";

import { createClient } from "@/lib/supabase/server";

export async function deletePromo(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DELETE ERROR:", error);
  }
}