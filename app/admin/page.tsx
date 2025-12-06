// app/admin/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  // 1) Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2) Fetch role from profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 3) If no profile or not admin → redirect
  if (error || !profile || profile.role !== "admin") {
    redirect("/");
  }

  // 4) Render the admin dashboard
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-gray-600">Welcome, Admin!</p>
    </div>
  );
}
