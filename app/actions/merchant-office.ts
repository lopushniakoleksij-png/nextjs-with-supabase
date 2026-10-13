"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function field(form: FormData, key: string, max: number) {
  const value = String(form.get(key) ?? "").trim();
  if (value.length > max) throw new Error("Field is too long: " + key);
  return value;
}
function uuid(value: string) {
  if (!UUID.test(value)) throw new Error("Invalid identifier");
  return value;
}
function optionalUuid(value: string) {
  return value ? uuid(value) : null;
}
function optionalUrl(value: string): string | null {
  if (!value) return null;
  let parsed: URL;
  try { parsed = new URL(value); }
  catch { throw new Error("Enter a valid website URL"); }
  if (!["https:", "http:"].includes(parsed.protocol)) {
    throw new Error("Website URL must use HTTP or HTTPS");
  }
  return parsed.toString();
}

async function merchantSession() {
  await requireUser(); // Supabase Auth session is verified on the server.
  return createClient(); // Per-user auth, never service-role.
}

function changed(organizationId: string) {
  revalidatePath("/merchant");
  revalidatePath("/merchant/business/" + organizationId);
  revalidatePath("/dashboard");
  revalidatePath("/admin/promo-codes");
}

export async function createMerchantStore(form: FormData) {
  const orgId = uuid(field(form, "organization_id", 36));
  const name = field(form, "name", 200);
  const slug = field(form, "slug", 100).toLowerCase();
  const website = optionalUrl(field(form, "website_url", 2048));

  if (name.length < 2 || !SLUG.test(slug)) {
    throw new Error("Store name or slug is invalid");
  }
  const supabase = await merchantSession();
  const { error } = await supabase.rpc("merchant_create_store", {
    p_organization_id: orgId,
    p_name: name,
    p_slug: slug,
    p_website_url: website,
  });
  if (error) throw new Error("Could not create branch. Check ownership and slug availability.");
  changed(orgId);
}

export async function createMerchantItem(form: FormData) {
  const orgId = uuid(field(form, "organization_id", 36));
  const storeId = uuid(field(form, "store_id", 36));
  const name = field(form, "name", 200);
  const type = field(form, "item_type", 16);
  const description = field(form, "description", 3000);
  const destination = optionalUrl(field(form, "destination_url", 2048));

  if (name.length < 2 || !["product", "service"].includes(type)) {
    throw new Error("Choose a valid product or service");
  }
  const supabase = await merchantSession();
  const { error } = await supabase.rpc("merchant_create_item", {
    p_organization_id: orgId,
    p_store_id: storeId,
    p_item_type: type,
    p_name: name,
    p_description: description || null,
    p_destination_url: destination,
  });
  if (error) throw new Error("Could not save item. Check business and store access.");
  changed(orgId);
}

export async function submitMerchantPromo(form: FormData) {
  const orgId = uuid(field(form, "organization_id", 36));
  const storeId = uuid(field(form, "store_id", 36));
  const itemId = optionalUuid(field(form, "item_id", 36));
  const code = field(form, "code", 80);
  const title = field(form, "title", 200);
  const description = field(form, "description", 3000);
  const destination = optionalUrl(field(form, "destination_url", 2048));
  const expiry = field(form, "expires_at", 10);
  if (!code || !destination) throw new Error("Promo code and destination URL are required");

  let expiresAt: string | null = null;
  if (expiry) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)) throw new Error("Expiry date is invalid");
    const expiryDate = new Date(expiry + "T23:59:59.999Z");
    if (Number.isNaN(expiryDate.getTime())) throw new Error("Expiry date is invalid");
    expiresAt = expiryDate.toISOString();
    if (expiryDate.getTime() <= Date.now()) throw new Error("Expiry must be in the future");
  }
  const supabase = await merchantSession();
  const { error } = await supabase.rpc("merchant_submit_promo", {
    p_organization_id: orgId,
    p_store_id: storeId,
    p_item_id: itemId,
    p_code: code,
    p_title: title || null,
    p_description: description || null,
    p_destination_url: destination,
    p_expires_at: expiresAt,
  });
  if (error) throw new Error("Could not submit promotion. Confirm the item belongs to this branch.");
  changed(orgId); // Pending only. Public listing still requires admin approval.
}

export async function withdrawMerchantPromo(form: FormData) {
  const orgId = uuid(field(form, "organization_id", 36));
  const promoId = uuid(field(form, "promo_id", 36));
  const supabase = await merchantSession();
  const { data, error } = await supabase.rpc("merchant_withdraw_promo", {
    p_organization_id: orgId,
    p_promo_id: promoId,
  });
  if (error || !data) throw new Error("Offer is unavailable for withdrawal");
  changed(orgId);
}
