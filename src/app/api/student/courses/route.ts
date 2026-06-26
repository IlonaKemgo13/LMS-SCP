import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"
import { paginationSchema } from "@/lib/validations"

export async function GET(req: Request) {
  const auth = await requireAuth("student")
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const parsed = paginationSchema.safeParse({
    page:      searchParams.get("page") ?? "1",
    page_size: searchParams.get("page_size") ?? "20",
  })
  const page     = parsed.success ? parsed.data.page : 1
  const pageSize = parsed.success ? parsed.data.page_size : 20
  const offset   = (page - 1) * pageSize

  const { data, count, error } = await auth.supabase
    .from("enrollments")
    .select(
      "course_id, enrolled_at, courses(id, title, description, teacher_id, profiles!courses_teacher_id_fkey(full_name))",
      { count: "exact" }
    )
    .eq("student_id", auth.userId)
    .range(offset, offset + pageSize - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    courses:  data ?? [],
    total:    count ?? 0,
    page,
    pageSize,
  })
}
