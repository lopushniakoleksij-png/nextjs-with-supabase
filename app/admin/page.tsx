import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PromoCodesAdmin } from "./promo-codes-admin"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect("/auth/login")

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role,email")
    .eq("id", auth.user.id)
    .single()

  if (error || !profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Logged in as {profile.email} — role: {profile.role}
      </p>

      <div className="mt-6">
        <PromoCodesAdmin />
      </div>
    </div>
  )
}
