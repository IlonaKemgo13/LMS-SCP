import { NextResponse } from "next/server"
import { requireAuth, validationError } from "@/lib/api-helpers"
import { createCourseSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const auth = await requireAuth(req, "admin")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = createCourseSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { title, description, code, teacher_id } = parsed.data

  const { error } = await auth.supabase.from("courses").insert({
    title,
    description: description ?? null,
    code: code ?? null,
    teacher_id,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
