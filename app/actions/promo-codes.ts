"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function togglePromoCode(id: string, isActive: boolean) {
  if (!id) throw new Error("Promo id is required");

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("promo_codes")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/promo-codes");
  revalidatePath("/dashboard");
}

export async function deletePromoCode(id: string) {
  if (!id) throw new Error("Promo id is required");

  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/promo-codes");
  revalidatePath("/dashboard");
}
