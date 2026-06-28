import { NextResponse } from "next/server"
import { requireAuth, validationError } from "@/lib/api-helpers"
import { createGradeSchema, updateGradeSchema } from "@/lib/validations"

async function verifyCourseOwnership(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  courseId: string,
  teacherId: string
) {
  const { data } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .single()
  return !!data
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, "teacher")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = createGradeSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { student_id, course_id, assessment_name, assessment_type, score, max_score } = parsed.data

  const owns = await verifyCourseOwnership(auth.supabase, course_id, auth.userId)
  if (!owns) {
    return NextResponse.json(
      { error: "You are not assigned to this course" },
      { status: 403 }
    )
  }

  const { error } = await auth.supabase.from("grades").insert({
    student_id,
    course_id,
    assessment_name,
    assessment_type,
    score,
    max_score,
    teacher_id: auth.userId,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const auth = await requireAuth(req, "teacher")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = updateGradeSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { id, ...updates } = parsed.data

  const { data: grade } = await auth.supabase
    .from("grades")
    .select("course_id")
    .eq("id", id)
    .single()

  if (!grade) {
    return NextResponse.json({ error: "Grade not found" }, { status: 404 })
  }

  const owns = await verifyCourseOwnership(
    auth.supabase,
    grade.course_id,
    auth.userId
  )
  if (!owns) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error } = await auth.supabase
    .from("grades")
    .update(updates)
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
