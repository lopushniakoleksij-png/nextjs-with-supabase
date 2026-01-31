"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function toBool(v: FormDataEntryValue | null) {
  return v === "on" || v === "true" || v === "1"
}

export async function createPromoCode(formData: FormData) {
  const supabase = await createClient()

  const title = String(formData.get("title") || "").trim()
  const code = String(formData.get("code") || "").trim()
  const description = String(formData.get("description") || "").trim()
  const is_active = toBool(formData.get("is_active"))
  const expires_at_raw = String(formData.get("expires_at") || "").trim()
  const expires_at = expires_at_raw ? new Date(expires_at_raw).toISOString() : null

  if (!title || !code) {
    throw new Error("Title and Code are required")
  }

  const { error } = await supabase.from("promo_codes").insert({
    title,
    code,
    description: description || null,
    is_active,
    expires_at,
  })

  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}

export async function togglePromoCode(id: string, nextValue: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("promo_codes")
    .update({ is_active: nextValue })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function deletePromoCode(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("promo_codes").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/admin")
}
