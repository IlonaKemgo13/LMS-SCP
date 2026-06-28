import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"

export async function GET(req: Request) {
  const auth = await requireAuth(req, "parent")
  if (!auth.ok) return auth.response

  const { data, error } = await auth.supabase
    .from("parent_student_links")
    .select("student_id, profiles!parent_student_links_student_id_fkey(id, full_name, email, avatar_url)")
    .eq("parent_id", auth.userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ children: data ?? [] })
}
