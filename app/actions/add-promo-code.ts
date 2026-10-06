"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

export async function addPromoCode(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const code = String(formData.get("code") || "").trim();
  const storeSlug = String(formData.get("store_slug") || "").trim().toLowerCase();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const destinationUrl = String(formData.get("destination_url") || "").trim();
  const expiresAtRaw = String(formData.get("expires_at") || "").trim();

  if (!code || !storeSlug || !destinationUrl) {
    throw new Error("Code, store and destination URL are required");
  }

  let parsedDestination: URL;
  try {
    parsedDestination = new URL(destinationUrl);
  } catch {
    throw new Error("Destination URL is invalid");
  }

  if (!["http:", "https:"].includes(parsedDestination.protocol)) {
    throw new Error("Destination URL must use http or https");
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", storeSlug)
    .eq("is_active", true)
    .single();

  if (storeError || !store) {
    throw new Error("Store is not available");
  }

  const expiresAt = expiresAtRaw
    ? new Date(`${expiresAtRaw}T23:59:59.999Z`).toISOString()
    : null;

  const { error } = await supabase.from("promo_codes").insert({
    store_id: store.id,
    code,
    title: title || null,
    description: description || null,
    destination_url: parsedDestination.toString(),
    expires_at: expiresAt,
    submitted_by: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/dashboard/promo-codes");
}
