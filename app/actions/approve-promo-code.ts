"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function approvePromo(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("promo_codes")
    .update({ approved: true })
    .eq("id", id);

  if (error) {
    console.error("APPROVE ERROR:", error);
    return;
  }

  redirect("/dashboard");
}