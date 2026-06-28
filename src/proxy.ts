import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"
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

  // Web clients send a cookie session. The mobile app has no cookie jar, so
  // it sends `Authorization: Bearer <access_token>` instead — without this
  // branch, every mobile request looked unauthenticated to this middleware
  // and was rejected before ever reaching the route handler.
  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  const supabase = bearerToken
    ? createSupabaseJsClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      )
    : createServerClient(
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
  } = bearerToken
    ? await supabase.auth.getUser(bearerToken)
    : await supabase.auth.getUser()

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

  // ── Disabled account → sign out and bounce to login, before anything else ──
  // roleDashboard(undefined/"disabled") resolves to "/", so if this ran after
  // the "pathname === '/'" check below it would redirect "/" → "/" forever.
  if (role === "disabled") {
    if (!bearerToken) await supabase.auth.signOut()

    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Account disabled" }, { status: 403 })
      : NextResponse.redirect(new URL("/", request.url))

    // Carry over the cookies signOut() just cleared on supabaseResponse.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })

    return response
  }

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

  // ── Forward the identity we already verified above ──────────────────────────
  // requireAuth() trusts these instead of repeating the getUser() + profile
  // round-trip we just did. Always overwritten here, never left as whatever
  // the original client sent, so a request can't spoof its own identity.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-verified-user-id", user.id)
  requestHeaders.set("x-verified-user-role", role ?? "")

  const finalResponse = NextResponse.next({ request: { headers: requestHeaders } })
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return finalResponse
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
    "/api/user/:path*",
  ],
}
