import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { submitMerchantApplication } from "@/app/actions/merchant-applications";

export const dynamic = "force-dynamic";

export default async function ApplyForMerchantOffice() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: pending, error } = await supabase
    .from("merchant_applications")
    .select("id")
    .eq("applicant_user_id", user.id)
    .eq("status", "pending")
    .limit(1);
  if (error) throw new Error("Unable to check current business applications");

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8 text-slate-900 sm:px-6">
      <Link href="/merchant" className="text-sm font-medium text-indigo-700 underline">
        Back to Merchant Office
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Register your business</h1>
      <p className="mt-2 text-slate-600">
        Request a private Merchant Office for your company, shop or services.
        Our administrator verifies every business before granting access.
      </p>
      {pending?.length ? (
        <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold">Your application is pending</h2>
          <p className="mt-2 text-sm text-slate-700">
            You can check its status in your Merchant Office. New applications
            can be submitted after the existing request has been reviewed.
          </p>
          <Link href="/merchant" className="mt-4 inline-block font-medium text-indigo-700 underline">
            View application status
          </Link>
        </section>
      ) : (
        <form action={submitMerchantApplication}
          className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <label htmlFor="organization_name" className="mb-1 block font-medium">Business name</label>
            <input id="organization_name" name="organization_name" required
              minLength={2} maxLength={200} autoComplete="organization"
              placeholder="Your shop or company"
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2"/>
          </div>
          <div>
            <label htmlFor="organization_type" className="mb-1 block font-medium">Business type</label>
            <select id="organization_type" name="organization_type" required defaultValue=""
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
              <option value="" disabled>Select business type</option>
              <option value="company">Company</option>
              <option value="shop">Shop or retailer</option>
              <option value="service_provider">Service provider</option>
            </select>
          </div>
          <div>
            <label htmlFor="contact_email" className="mb-1 block font-medium">Business contact email</label>
            <input id="contact_email" name="contact_email" type="email" required maxLength={254}
              placeholder="contact@yourbusiness.co.uk" autoComplete="email"
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2"/>
          </div>
          <div>
            <label htmlFor="website_url" className="mb-1 block font-medium">Business website (optional)</label>
            <input id="website_url" name="website_url" type="url" maxLength={2048}
              placeholder="https://yourbusiness.co.uk"
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2"/>
          </div>
          <div>
            <label htmlFor="company_registration_number" className="mb-1 block font-medium">
              Company registration number (if applicable)
            </label>
            <input id="company_registration_number" name="company_registration_number" maxLength={64}
              placeholder="Companies House number"
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2"/>
          </div>
          <div>
            <label htmlFor="application_note" className="mb-1 block font-medium">
              About your products or services (optional)
            </label>
            <textarea id="application_note" name="application_note" rows={4} maxLength={2000}
              placeholder="What does your business offer?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"/>
          </div>
          <p className="text-sm text-slate-600">
            Submission does not grant publishing rights. Our team will review
            ownership and business details before approval.
          </p>
          <button type="submit" className="min-h-12 w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white sm:w-auto">
            Submit for verification
          </button>
        </form>
      )}
    </main>
  );
}
