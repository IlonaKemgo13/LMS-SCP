import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"

export async function GET(req: Request) {
  const auth = await requireAuth(req, "student")
  if (!auth.ok) return auth.response

  const [profileResult, enrollmentsResult, announcementsResult, gradesResult] =
    await Promise.all([
      auth.supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url")
        .eq("id", auth.userId)
        .single(),
      auth.supabase
        .from("enrollments")
        .select("course_id, courses(id, title, teacher_id, profiles!courses_teacher_id_fkey(full_name))")
        .eq("student_id", auth.userId),
      auth.supabase
        .from("announcements")
        .select("id, title, content, deadline, created_at, course_id")
        .order("created_at", { ascending: false })
        .limit(5),
      auth.supabase
        .from("grades")
        .select("id, assessment_type, score, max_score, created_at, course_id")
        .eq("student_id", auth.userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const courseIds = (enrollmentsResult.data ?? []).map((e) => e.course_id)

  let recordingCount = 0
  if (courseIds.length > 0) {
    const { count } = await auth.supabase
      .from("recordings")
      .select("*", { count: "exact", head: true })
      .in("course_id", courseIds)
    recordingCount = count ?? 0
  }

  return NextResponse.json({
    profile:        profileResult.data ?? null,
    enrollments:    enrollmentsResult.data ?? [],
    announcements:  announcementsResult.data ?? [],
    recentGrades:   gradesResult.data ?? [],
    recordingCount,
  })
}
