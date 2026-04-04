"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function rejectPromo(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("promo_codes")
    .update({ approved: false })
    .eq("id", id);

  if (error) {
    console.error("REJECT ERROR:", error);
    return;
  }

  revalidatePath("/dashboard");
}