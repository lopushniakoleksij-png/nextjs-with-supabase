"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/app/providers/ToastProvider";
import { useState } from "react";

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        showToast(error.message, "error");
        return;
      }

      showToast("Logged out successfully", "success");

      // redirect to login
      router.replace("/auth/login");
    } catch (err) {
      showToast("Failed to log out", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-60"
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}

