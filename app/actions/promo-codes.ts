"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function togglePromoCode(id: string, isActive: boolean) {
  const supabase = await createClient()

  await supabase
    .from("promo_codes")
    .update({ is_active: !isActive })
    .eq("id", id)

  revalidatePath("/admin/promo-codes")
}

export async function deletePromoCode(id: string) {
  const supabase = await createClient()

  await supabase
    .from("promo_codes")
    .delete()
    .eq("id", id)

  revalidatePath("/admin/promo-codes")
}
