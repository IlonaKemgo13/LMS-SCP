import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"
import { paginationSchema } from "@/lib/validations"

export async function GET(req: Request) {
  const auth = await requireAuth("parent")
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const parsed = paginationSchema.safeParse({
    page:      searchParams.get("page") ?? "1",
    page_size: searchParams.get("page_size") ?? "20",
  })
  const page     = parsed.success ? parsed.data.page : 1
  const pageSize = parsed.success ? parsed.data.page_size : 20
  const offset   = (page - 1) * pageSize

  // Get course IDs for all linked children
  const { data: links } = await auth.supabase
    .from("parent_links")
    .select("student_id")
    .eq("parent_id", auth.userId)

  const childIds = (links ?? []).map((l) => l.student_id)

  const { data: enrollments } = childIds.length > 0
    ? await auth.supabase
        .from("enrollments")
        .select("course_id")
        .in("student_id", childIds)
    : { data: [] }

  const courseIds = (enrollments ?? []).map((e) => e.course_id)

  const orFilter = courseIds.length > 0
    ? `course_id.in.(${courseIds.join(",")}),course_id.is.null`
    : "course_id.is.null"

  const { data, count, error } = await auth.supabase
    .from("announcements")
    .select("id, title, content, deadline, created_at, course_id, courses(title)", { count: "exact" })
    .or(orFilter)
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    announcements: data ?? [],
    total:         count ?? 0,
    page,
    pageSize,
  })
}
