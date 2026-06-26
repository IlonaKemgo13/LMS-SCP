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
    .from("final_results")
    .select("id, title, domain, semester, file_url, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    results:  data ?? [],
    total:    count ?? 0,
    page,
    pageSize,
  })
}
