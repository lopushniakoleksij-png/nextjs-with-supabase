import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect("/auth/login")
  }

  return data.user
}
