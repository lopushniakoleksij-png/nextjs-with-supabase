"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePromo(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DELETE ERROR:", error);
    return;
  }

  revalidatePath("/dashboard");
}