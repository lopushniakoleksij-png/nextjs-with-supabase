"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function textField(formData: FormData, name: string, limit: number) {
  const value = String(formData.get(name) || "").trim();
  if (value.length > limit) throw new Error(`${name} is too long`);
  return value;
}

export async function submitMerchantApplication(formData: FormData) {
  // Never take applicant identity or verification status from client input.
  const user = await requireUser();
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const name = textField(formData, "organization_name", 200);
  const type = textField(formData, "organization_type", 30);
  const email = textField(formData, "contact_email", 254);
  const websiteRaw = textField(formData, "website_url", 2048);
  const companyNumber = textField(formData, "company_registration_number", 64);
  const note = textField(formData, "application_note", 2000);

  if (name.length < 2 || !["company", "shop", "service_provider"].includes(type)) {
    throw new Error("A business name and valid business type are required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid business contact email");
  }

  let website: string | null = null;
  if (websiteRaw) {
    let parsed: URL;
    try { parsed = new URL(websiteRaw); }
    catch { throw new Error("Business website URL is invalid"); }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Business website must use HTTPS or HTTP");
    }
    website = parsed.toString();
  }

  const { error } = await supabase.from("merchant_applications").insert({
    applicant_user_id: user.id,
    organization_name: name,
    organization_type: type,
    contact_email: email,
    website_url: website,
    company_registration_number: companyNumber || null,
    application_note: note || null,
  });
  if (error) {
    // Don't reveal database internals to applicants.
    if (error.code === "23505") {
      throw new Error("You already have a pending business application");
    }
    throw new Error("Could not submit the business application");
  }

  revalidatePath("/merchant");
  revalidatePath("/admin/merchants");
  redirect("/merchant?application=submitted");
}

export async function reviewMerchantApplication(formData: FormData) {
  const { supabase } = await requireAdmin();
  const applicationId = String(formData.get("application_id") || "").trim();
  const decision = String(formData.get("decision") || "").trim();

  if (!UUID.test(applicationId) || !["approve", "reject"].includes(decision)) {
    throw new Error("Invalid merchant review request");
  }

  // A single SECURITY DEFINER function locks the pending row, checks the
  // actual platform admin, and atomically creates the verified business+owner.
  const { error } = await supabase.rpc("review_merchant_application", {
    p_application_id: applicationId,
    p_decision: decision,
  });
  if (error) throw new Error("Could not complete merchant verification");

  revalidatePath("/admin/merchants");
  revalidatePath("/merchant");
}
