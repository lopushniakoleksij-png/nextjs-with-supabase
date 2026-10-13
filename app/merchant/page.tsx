import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Application = {
  id: string;
  organization_name: string;
  organization_type: string;
  status: string;
  created_at: string;
};

type Organization = {
  id: string;
  name: string;
  organization_type: string;
  status: string;
};

type Membership = {
  organization_id: string;
  member_role: string;
  status: string;
};

export default async function MerchantOffice() {
  const user = await requireUser();
  const supabase = await createClient();

  const [applicationsResult, membershipResult] = await Promise.all([
    supabase.from("merchant_applications")
      .select("id, organization_name, organization_type, status, created_at")
      .eq("applicant_user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("merchant_memberships")
      .select("organization_id, member_role, status")
      .eq("user_id", user.id),
  ]);

  if (applicationsResult.error || membershipResult.error) {
    throw new Error("Unable to load your Merchant Office");
  }

  const applications = (applicationsResult.data || []) as Application[];
  const memberships = (membershipResult.data || []) as Membership[];
  const activeMemberships = memberships.filter((row) => row.status === "active");
  const orgIds = activeMemberships.map((row) => row.organization_id);

  let organizations: Organization[] = [];
  if (orgIds.length) {
    const result = await supabase.from("merchant_organizations")
      .select("id, name, organization_type, status").in("id", orgIds);
    if (result.error) throw new Error("Unable to load verified business accounts");
    organizations = (result.data || []) as Organization[];
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 text-slate-900 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
            Promo Code 4
          </p>
          <h1 className="mt-1 text-3xl font-bold">Merchant Office</h1>
          <p className="mt-2 text-slate-600">
            Manage your verified business accounts and application status.
          </p>
        </div>
        <Link href="/merchant/apply"
          className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">
          Register a business
        </Link>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-bold">My businesses</h2>
        {organizations.length === 0 ? (
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600">
            No verified business accounts yet. Apply to register a shop,
            company or service provider.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {organizations.map((org) => {
              const membership = activeMemberships.find((m) => m.organization_id === org.id);
              return (
                <article key={org.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="break-words text-lg font-semibold">{org.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {org.organization_type.replaceAll("_", " ")} · {membership?.member_role}
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    Status: <span className={org.status === "verified" ? "text-green-700" : "text-amber-700"}>
                      {org.status}
                    </span>
                  </p>
                  {org.status === "verified" ? (
                    <Link href={`/merchant/business/${org.id}`}
                      className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">
                      Manage shops and offers
                    </Link>
                  ) : (
                    <p className="mt-3 text-sm text-amber-700">
                      This business requires an administrator review before
                      shops and offers can be managed.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-9">
        <h2 className="text-xl font-bold">Business applications</h2>
        {applications.length === 0 ? (
          <p className="mt-3 text-slate-600">You have not submitted any business applications.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {applications.map((app) => (
              <article key={app.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <h3 className="font-semibold">{app.organization_name}</h3>
                  <p className="text-sm text-slate-600">
                    Applied {new Date(app.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                  {app.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
      <Link href="/" className="mt-8 inline-block text-sm font-medium text-indigo-700 underline">
        Back to the public website
      </Link>
    </main>
  );
}
