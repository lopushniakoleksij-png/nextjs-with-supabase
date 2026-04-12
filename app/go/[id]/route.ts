import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()

  const id = params.id

  const { success } = await req.json()

  const field = success ? "works_count" : "fail_count"

  const { error } = await supabase.rpc("increment", {
    row_id: id,
    column_name: field,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}