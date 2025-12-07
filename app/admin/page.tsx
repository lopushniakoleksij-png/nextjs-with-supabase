"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") return router.push("/");

      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Welcome, Admin!</p>
    </div>
  );
}
