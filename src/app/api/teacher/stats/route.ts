import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const auth = await requireAuth("teacher")
  if (!auth.ok) return auth.response

  const [
    { count: courses },
    { data: courseRows },
    { count: grades },
    { count: materials },
    { count: recordings },
  ] = await Promise.all([
    auth.supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", auth.userId),
    auth.supabase
      .from("courses")
      .select("id")
      .eq("teacher_id", auth.userId),
    auth.supabase
      .from("grades")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", auth.userId),
    auth.supabase
      .from("materials")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", auth.userId),
    auth.supabase
      .from("recordings")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", auth.userId),
  ])

  const courseIds = (courseRows ?? []).map((c) => c.id)
  let students = 0
  if (courseIds.length > 0) {
    const { count } = await auth.supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .in("course_id", courseIds)
    students = count ?? 0
  }

  return NextResponse.json({
    courses:    courses    ?? 0,
    students,
    grades:     grades     ?? 0,
    materials:  materials  ?? 0,
    recordings: recordings ?? 0,
  })
}
