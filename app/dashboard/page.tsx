import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { approvePromo } from "../actions/approve-promo-code";
import { rejectPromo } from "../actions/reject-promo-code";
import { deletePromo } from "../actions/delete-promo-code";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 🔐 Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 🔐 Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // 📊 Stats
const { count: totalCount } = await supabase
  .from("promo_codes")
  .select("*", { count: "exact", head: true });

const { count: pendingCount } = await supabase
  .from("promo_codes")
  .select("*", { count: "exact", head: true })
  .eq("approved", false);

const { count: approvedCount } = await supabase
  .from("promo_codes")
  .select("*", { count: "exact", head: true })
  .eq("approved", true);

  // 📦 Fetch pending promo codes
  const { data: promoCodes, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("approved", false)
    .order("expires_at", { ascending: true });

  if (error) {
    console.error("FETCH ERROR:", error);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <p className="text-red-500">Failed to load promo codes.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4 mb-8">
  <div className="bg-white p-4 rounded shadow">
    <p className="text-sm text-gray-500">Total Codes</p>
    <p className="text-2xl font-bold">{totalCount || 0}</p>
  </div>

  <div className="bg-yellow-50 p-4 rounded shadow">
    <p className="text-sm text-gray-500">Pending</p>
    <p className="text-2xl font-bold">{pendingCount || 0}</p>
  </div>

  <div className="bg-green-50 p-4 rounded shadow">
    <p className="text-sm text-gray-500">Approved</p>
    <p className="text-2xl font-bold">{approvedCount || 0}</p>
  </div>
</div>
      <h1 className="text-2xl font-bold mb-6">Pending Promo Codes</h1>

      {!promoCodes || promoCodes.length === 0 ? (
        <p>No pending promo codes.</p>
      ) : (
        <div className="space-y-4">
          {promoCodes.map((code) => (
            <div
              key={code.id}
              className="border p-4 rounded shadow-sm bg-white"
            >
              <h2 className="text-lg font-semibold mb-1">
                {code.store_slug}
              </h2>

              <p className="text-sm">
                Code: <strong>{code.code}</strong>
              </p>

              {code.description && (
                <p className="text-sm text-gray-600">
                  {code.description}
                </p>
              )}

              {code.expires_at && (
                <p className="text-sm text-gray-500">
                  Expires: {code.expires_at}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <form action={approvePromo.bind(null, code.id)}>
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    Approve
                  </button>
                </form>

                <form action={rejectPromo.bind(null, code.id)}>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Reject
                  </button>
                </form>

                <form action={deletePromo.bind(null, code.id)}>
                  <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}