"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deletePromo(id: string) {
  const supabase = await createClient();

  await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id);

  revalidatePath("/dashboard");
}