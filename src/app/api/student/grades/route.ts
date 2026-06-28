import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"
import { paginationSchema } from "@/lib/validations"

export async function GET(req: Request) {
  const auth = await requireAuth(req, "student")
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const parsed = paginationSchema.safeParse({
    page:      searchParams.get("page") ?? "1",
    page_size: searchParams.get("page_size") ?? "20",
  })
  const page     = parsed.success ? parsed.data.page : 1
  const pageSize = parsed.success ? parsed.data.page_size : 20
  const offset   = (page - 1) * pageSize
  const courseId = searchParams.get("course_id")

  let query = auth.supabase
    .from("grades")
    .select("id, assessment_type, score, max_score, created_at, course_id, courses(title)", { count: "exact" })
    .eq("student_id", auth.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (courseId) {
    query = query.eq("course_id", courseId)
  }

  const { data, count, error } = await query

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
