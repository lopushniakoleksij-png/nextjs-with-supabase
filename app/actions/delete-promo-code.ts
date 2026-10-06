"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function deletePromo(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Promo id is required");

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/admin/promo-codes");
}
