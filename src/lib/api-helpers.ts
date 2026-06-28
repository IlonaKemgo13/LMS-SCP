import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createSupabaseJsClient, type SupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export type AuthResult =
  | { ok: true; userId: string; role: string; supabase: SupabaseClient }
  | { ok: false; response: NextResponse }

// Web clients authenticate via the Supabase SSR cookie session. A mobile app
// has no cookie jar, so it instead sends `Authorization: Bearer <access_token>`
// (the Supabase session's access_token), which is verified directly here.
export async function requireAuth(request: Request, expectedRole?: string): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  let supabase: SupabaseClient
  let userId: string

  if (bearerToken) {
    supabase = createSupabaseJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error } = await supabase.auth.getUser(bearerToken)

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      }
    }

    userId = user.id
  } else {
    supabase = await createServerClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      }
    }

    userId = user.id
  }

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

  if (expectedRole && profile.role !== expectedRole) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { ok: true, userId, role: profile.role, supabase }
}

export function validationError(issues: { message: string }[]) {
  return NextResponse.json(
    { error: issues.map((i) => i.message).join(", ") },
    { status: 400 }
  )
}
