import { NextResponse } from "next/server"
import { requireAuth, validationError } from "@/lib/api-helpers"
import { createParentLinkSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const auth = await requireAuth("admin")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = createParentLinkSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { parent_id, student_id } = parsed.data

  const { error } = await auth.supabase
    .from("parent_student_links")
    .insert({ parent_id, student_id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
