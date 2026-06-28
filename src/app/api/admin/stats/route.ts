import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"

export async function GET(req: Request) {
  const auth = await requireAuth(req, "admin")
  if (!auth.ok) return auth.response

  const [
    { count: totalUsers },
    { count: teachers },
    { count: students },
    { count: parents },
    { count: courses },
    { count: enrollments },
  ] = await Promise.all([
    auth.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
    auth.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "teacher"),
    auth.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student"),
    auth.supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "parent"),
    auth.supabase
      .from("courses")
      .select("*", { count: "exact", head: true }),
    auth.supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true }),
  ])

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    teachers:   teachers   ?? 0,
    students:   students   ?? 0,
    parents:    parents    ?? 0,
    courses:    courses    ?? 0,
    enrollments:enrollments?? 0,
  })
}
