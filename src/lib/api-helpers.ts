import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export type AuthResult =
  | { ok: true; userId: string; role: string; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; response: NextResponse }

export async function requireAuth(expectedRole?: string): Promise<AuthResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
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

  return { ok: true, userId: user.id, role: profile.role, supabase }
}

export function validationError(issues: { message: string }[]) {
  return NextResponse.json(
    { error: issues.map((i) => i.message).join(", ") },
    { status: 400 }
  )
}
