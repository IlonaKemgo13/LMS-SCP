import { NextResponse } from "next/server"
import { requireAuth, validationError } from "@/lib/api-helpers"
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "@/lib/validations"

export async function POST(req: Request) {
  const auth = await requireAuth("teacher")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = createAnnouncementSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { title, content, deadline, course_id } = parsed.data

  if (course_id) {
    const { data: course } = await auth.supabase
      .from("courses")
      .select("id")
      .eq("id", course_id)
      .eq("teacher_id", auth.userId)
      .single()

    if (!course) {
      return NextResponse.json(
        { error: "You are not assigned to this course" },
        { status: 403 }
      )
    }
  }

  const { error } = await auth.supabase.from("announcements").insert({
    title,
    content: content ?? null,
    deadline: deadline ?? null,
    course_id: course_id ?? null,
    teacher_id: auth.userId,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const auth = await requireAuth("teacher")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = updateAnnouncementSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { id, ...updates } = parsed.data

  const { data: ann } = await auth.supabase
    .from("announcements")
    .select("teacher_id")
    .eq("id", id)
    .single()

  if (!ann || ann.teacher_id !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error } = await auth.supabase
    .from("announcements")
    .update(updates)
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
