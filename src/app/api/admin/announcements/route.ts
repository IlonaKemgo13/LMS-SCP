import { NextResponse } from "next/server"
import { requireAuth, validationError } from "@/lib/api-helpers"
import { createAnnouncementSchema } from "@/lib/validations"

export async function POST(req: Request) {
  const auth = await requireAuth(req, "admin")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = createAnnouncementSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { title, content, deadline, course_id, target_role, is_global } = parsed.data

  const { error } = await auth.supabase.from("announcements").insert({
    title,
    content:     content ?? null,
    deadline:    deadline ?? null,
    course_id:   course_id ?? null,
    target_role: target_role ?? null,
    is_global:   is_global ?? false,
    created_by:  auth.userId,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
