"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createStore(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const websiteUrl = String(formData.get("website_url") || "").trim();
  const affiliateUrl = String(formData.get("affiliate_url") || "").trim();

  if (!name || !SLUG_PATTERN.test(slug)) {
    throw new Error("A valid store name and slug are required");
  }

  const validateOptionalUrl = (value: string) => {
    if (!value) return null;
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Store URLs must use http or https");
    }
    return parsed.toString();
  };

  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("stores").insert({
    name,
    slug,
    website_url: validateOptionalUrl(websiteUrl),
    affiliate_url: validateOptionalUrl(affiliateUrl),
    is_active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/stores");
  revalidatePath("/sitemap.xml");
}

export async function toggleStore(id: string, isActive: boolean) {
  if (!id) throw new Error("Store id is required");

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("stores")
    .update({ is_active: !isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/stores");
  revalidatePath("/");
}
