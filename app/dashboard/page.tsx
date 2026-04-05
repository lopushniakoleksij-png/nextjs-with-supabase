import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { approvePromo } from "@/app/actions/approve-promo-code";
import { rejectPromo } from "@/app/actions/reject-promo-code";
import { deletePromo } from "@/app/actions/delete-promo-code";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

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

  // 📦 Fetch pending
  const { data: promoCodes, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("approved", false)
    .order("expires_at", { ascending: true });

  if (error) {
    console.error(error);
    return <p>Error loading promo codes</p>;
  }

  return (
    <div className="p-6">
      {/* 📊 Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p>Total</p>
          <p className="text-xl font-bold">{totalCount || 0}</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded shadow">
          <p>Pending</p>
          <p className="text-xl font-bold">{pendingCount || 0}</p>
        </div>

        <div className="bg-green-50 p-4 rounded shadow">
          <p>Approved</p>
          <p className="text-xl font-bold">{approvedCount || 0}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">Pending Promo Codes</h1>

      {!promoCodes?.length ? (
        <p>No pending promo codes</p>
      ) : (
        <div className="space-y-4">
          {promoCodes.map((code) => (
            <div key={code.id} className="border p-4 rounded bg-white">
              <h2 className="font-semibold">{code.store_slug}</h2>

              <p>
                Code: <strong>{code.code}</strong>
              </p>

              <div className="flex gap-2 mt-4">
                {/* ✅ APPROVE */}
                <form action={approvePromo}>
                  <input type="hidden" name="id" value={code.id} />
                  <button className="bg-green-600 text-white px-3 py-1 rounded">
                    Approve
                  </button>
                </form>

                {/* ✅ REJECT */}
                <form action={rejectPromo}>
                  <input type="hidden" name="id" value={code.id} />
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded">
                    Reject
                  </button>
                </form>

                {/* ✅ DELETE */}
                <form action={deletePromo}>
                  <input type="hidden" name="id" value={code.id} />
                  <button className="bg-red-600 text-white px-3 py-1 rounded">
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