"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthButton() {
  const supabase = createClient();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut({ scope: "global" });
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className="rounded-md bg-black px-3 py-2 text-sm text-white"
    >
      Logout
    </button>
  );
}

