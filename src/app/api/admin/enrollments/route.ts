import { NextResponse } from "next/server"
import { requireAuth, validationError } from "@/lib/api-helpers"
import { createEnrollmentSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const auth = await requireAuth("admin")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = createEnrollmentSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { student_id, course_id } = parsed.data

  const { error } = await auth.supabase
    .from("enrollments")
    .insert({ student_id, course_id })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
