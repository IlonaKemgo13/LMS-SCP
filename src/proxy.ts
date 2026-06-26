import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function roleDashboard(role: string | undefined | null): string {
  switch (role) {
    case "admin":   return "/admin"
    case "teacher": return "/teacher"
    case "student": return "/student-dashboard"
    case "parent":  return "/dashboard/parent"
    default:        return "/"
  }
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!user) {
    if (pathname === "/" || pathname === "/reset-password") return supabaseResponse
    // API routes → JSON 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Pages → redirect to login
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // ── Fetch role ─────────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role as string | undefined

  // ── Authenticated user hits login page → send to their dashboard ──────────
  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = roleDashboard(role)
    return NextResponse.redirect(url)
  }

  // ── Role-based route guards ────────────────────────────────────────────────
  function forbidden() {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const url = request.nextUrl.clone()
    url.pathname = roleDashboard(role)
    return NextResponse.redirect(url)
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/")
  ) {
    if (role !== "admin") return forbidden()
  }

  if (
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/api/teacher/")
  ) {
    if (role !== "teacher") return forbidden()
  }

  // Student pages live at /student-* (not under a shared folder)
  const isStudentPage =
    pathname.startsWith("/student-dashboard") ||
    pathname.startsWith("/student-courses") ||
    pathname.startsWith("/student-grades") ||
    pathname.startsWith("/student-announcements") ||
    pathname.startsWith("/student-materials") ||
    pathname.startsWith("/student-recordings") ||
    pathname.startsWith("/student-results") ||
    pathname.startsWith("/student-settings")

  if (isStudentPage || pathname.startsWith("/api/student/")) {
    if (role !== "student") return forbidden()
  }

  if (
    pathname.startsWith("/dashboard/parent") ||
    pathname.startsWith("/api/parent/")
  ) {
    if (role !== "parent") return forbidden()
  }

  // /api/auth/* — any authenticated user (already authenticated above)

  return supabaseResponse
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/teacher/:path*",
    "/student-dashboard",
    "/student-dashboard/:path*",
    "/student-courses",
    "/student-courses/:path*",
    "/student-grades",
    "/student-grades/:path*",
    "/student-announcements",
    "/student-announcements/:path*",
    "/student-materials",
    "/student-materials/:path*",
    "/student-recordings",
    "/student-recordings/:path*",
    "/student-results",
    "/student-results/:path*",
    "/student-settings",
    "/student-settings/:path*",
    "/dashboard/parent",
    "/dashboard/parent/:path*",
    "/api/admin/:path*",
    "/api/teacher/:path*",
    "/api/student/:path*",
    "/api/parent/:path*",
    "/api/auth/:path*",
  ],
}
