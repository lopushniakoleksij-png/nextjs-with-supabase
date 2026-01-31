import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "@/app/actions/logout"

export async function AuthButton() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ? (
    <form action={logoutAction}>
      <Button type="submit" variant="outline">
        Logout
      </Button>
    </form>
  ) : (
    <div className="flex gap-2">
      <Button asChild variant="outline">
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
