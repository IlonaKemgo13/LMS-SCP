import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"
import { paginationSchema } from "@/lib/validations"

export async function GET(req: Request) {
  const auth = await requireAuth(req, "parent")
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const parsed = paginationSchema.safeParse({
    page:      searchParams.get("page") ?? "1",
    page_size: searchParams.get("page_size") ?? "20",
  })
  const page     = parsed.success ? parsed.data.page : 1
  const pageSize = parsed.success ? parsed.data.page_size : 20
  const offset   = (page - 1) * pageSize
  const studentId = searchParams.get("student_id")

  // Verify the requested student is linked to this parent
  const { data: links, error: linksError } = await auth.supabase
    .from("parent_student_links")
    .select("student_id")
    .eq("parent_id", auth.userId)

  if (linksError) {
    return NextResponse.json({ error: linksError.message }, { status: 400 })
  }

  const childIds = (links ?? []).map((l) => l.student_id)

  if (studentId && !childIds.includes(studentId)) {
    return NextResponse.json({ error: "This student is not linked to your account" }, { status: 403 })
  }

  const ids = studentId ? [studentId] : childIds

  const { data, count, error } = await auth.supabase
    .from("grades")
    .select(
      "id, student_id, assessment_type, score, max_score, created_at, course_id, courses(title), profiles!grades_student_id_fkey(full_name)",
      { count: "exact" }
    )
    .in("student_id", ids)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    grades:   data ?? [],
    total:    count ?? 0,
    page,
    pageSize,
  })
}
