import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // NOT LOGGED IN
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="text-sm text-gray-600 hover:text-black"
        >
          Sign in
        </Link>

        <Link
          href="/auth/sign-up"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
        >
          Sign up
        </Link>
      </div>
    );
  }

  // LOGGED IN
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-gray-600">{user.email}</span>
      <LogoutButton />
    </div>
  );
}

