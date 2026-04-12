"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approvePromo(formData: FormData) {
  const id = formData.get("id") as string;

  const supabase = await createClient();

  const { error } = await supabase
    .from("promo_codes")
    .update({ approved: true })
    .eq("id", id);

  if (error) {
    console.error("APPROVE ERROR:", error);
    return;
  }

  revalidatePath("/dashboard");
}