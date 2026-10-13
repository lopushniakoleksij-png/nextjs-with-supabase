import { requireAdmin } from "@/lib/auth/requireAdmin";
import { reviewMerchantApplication } from "@/app/actions/merchant-applications";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Application = {
  id: string;
  organization_name: string;
  organization_type: string;
  contact_email: string;
  website_url: string | null;
  company_registration_number: string | null;
  application_note: string | null;
  applicant_user_id: string;
  created_at: string;
};

export default async function MerchantApplicationsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("merchant_applications")
    .select("id, organization_name, organization_type, contact_email, website_url, company_registration_number, application_note, applicant_user_id, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw new Error("Unable to load merchant verification queue");
  const applications = (data || []) as Application[];

  return (
    <section className="min-w-0 space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Platform administrator</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Business verification</h1>
        <p className="mt-2 text-sm text-slate-600">
          Verify business ownership before approval. Approval creates a verified
          organization and grants its applicant the initial owner membership.
          Businesses cannot approve their own applications.
        </p>
      </header>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600">
          No merchant applications awaiting review.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <article key={app.id} className="min-w-0 space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h2 className="break-words text-lg font-bold">{app.organization_name}</h2>
                <p className="text-sm text-slate-600">{app.organization_type.replaceAll("_", " ")}</p>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="font-medium">Business contact</dt><dd className="break-all">{app.contact_email}</dd></div>
                <div><dt className="font-medium">Applied</dt><dd>{new Date(app.created_at).toLocaleDateString("en-GB")}</dd></div>
                <div><dt className="font-medium">Registration number</dt><dd>{app.company_registration_number || "Not provided"}</dd></div>
                <div><dt className="font-medium">Applicant account</dt><dd className="break-all text-xs">{app.applicant_user_id}</dd></div>
              </dl>
              {app.website_url && (
                <a href={app.website_url} target="_blank" rel="noopener noreferrer"
                  className="block break-all text-sm font-medium text-indigo-700 underline">
                  Business website
                </a>
              )}
              {app.application_note && (
                <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {app.application_note}
                </p>
              )}
              <p className="text-xs text-amber-800">
                Review evidence manually before approving. Do not approve based on an email address alone.
              </p>
              <div className="flex flex-wrap gap-3">
                <form action={reviewMerchantApplication}>
                  <input type="hidden" name="application_id" value={app.id}/>
                  <input type="hidden" name="decision" value="approve"/>
                  <button type="submit"
                    className="min-h-11 rounded-lg bg-green-700 px-4 py-2 font-semibold text-white">
                    Verify and approve
                  </button>
                </form>
                <form action={reviewMerchantApplication}>
                  <input type="hidden" name="application_id" value={app.id}/>
                  <input type="hidden" name="decision" value="reject"/>
                  <button type="submit"
                    className="min-h-11 rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-800">
                    Reject application
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
      <Link href="/dashboard" className="inline-block text-sm font-medium text-indigo-700 underline">
        Back to admin dashboard
      </Link>
    </section>
  );
}
