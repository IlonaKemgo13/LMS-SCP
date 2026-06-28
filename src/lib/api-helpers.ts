import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export type AuthResult =
  | { ok: true; userId: string; role: string; supabase: SupabaseClient }
  | { ok: false; response: NextResponse }

function unauthorized(): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  }
}

// Web clients authenticate via the Supabase SSR cookie session. A mobile app
// has no cookie jar, so it instead sends `Authorization: Bearer <access_token>`
// (the Supabase session's access_token). Crucially, that token is also
// attached as a global header on the client below — without it, calls like
// `.from("grades")` later would run unauthenticated against RLS regardless of
// whether getUser() above succeeded.
//
// proxy.ts already verifies the caller and resolves their role for every
// route it matches, then forwards x-verified-user-id / x-verified-user-role
// (set only by our own middleware — never trusted from the original client
// request). Reusing those skips a second getUser() + profile round-trip here.
// If they're missing (a route proxy.ts doesn't cover), this verifies directly
// as a fallback, so nothing is left unauthenticated.
export async function requireAuth(request: Request, expectedRole?: string): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  const supabase: SupabaseClient = bearerToken
    ? createSupabaseJsClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      )
    : await createServerClient()

  let userId: string
  let role: string

  const trustedUserId = request.headers.get("x-verified-user-id")
  const trustedRole = request.headers.get("x-verified-user-role")

  if (trustedUserId && trustedRole) {
    userId = trustedUserId
    role = trustedRole
  } else {
    const { data: { user }, error } = bearerToken
      ? await supabase.auth.getUser(bearerToken)
      : await supabase.auth.getUser()

    if (error || !user) return unauthorized()
    userId = user.id

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (!profile) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Profile not found" }, { status: 403 }),
      }
    }

    role = profile.role
  }

  if (expectedRole && role !== expectedRole) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { ok: true, userId, role, supabase }
}

export function validationError(issues: { message: string }[]) {
  return NextResponse.json(
    { error: issues.map((i) => i.message).join(", ") },
    { status: 400 }
  )
}
