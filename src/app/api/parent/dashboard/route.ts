import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"

export async function GET(req: Request) {
  const auth = await requireAuth(req, "parent")
  if (!auth.ok) return auth.response

  // Fetch linked children
  const { data: links } = await auth.supabase
    .from("parent_links")
    .select("student_id")
    .eq("parent_id", auth.userId)

  const childIds = (links ?? []).map((l) => l.student_id)

  if (childIds.length === 0) {
    return NextResponse.json({
      children:      [],
      recentGrades:  [],
      announcements: [],
    })
  }

  const [childrenResult, gradesResult, announcementsResult] = await Promise.all([
    auth.supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", childIds),
    auth.supabase
      .from("grades")
      .select("id, student_id, assessment_type, score, max_score, created_at, course_id, courses(title), profiles!grades_student_id_fkey(full_name)")
      .in("student_id", childIds)
      .order("created_at", { ascending: false })
      .limit(10),
    auth.supabase
      .from("announcements")
      .select("id, title, content, deadline, created_at, course_id")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return NextResponse.json({
    children:      childrenResult.data ?? [],
    recentGrades:  gradesResult.data ?? [],
    announcements: announcementsResult.data ?? [],
  })
}
