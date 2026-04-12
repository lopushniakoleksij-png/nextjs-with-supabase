import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const id = context.params.id

    const body = await req.json()
    const success = body.success === true

    const field = success ? "works_count" : "fail_count"

    const { error } = await supabase.rpc("increment", {
      row_id: id,
      column_name: field,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}