import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-helpers"
import { changePasswordSchema } from "@/lib/validations"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const auth = await requireAuth(req)
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = changePasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    )
  }

  const { current_password, new_password } = parsed.data

  // Get user email to verify current password via sign-in
  const { data: { user } } = await auth.supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: "Could not identify user" }, { status: 400 })
  }

  // Verify current password by attempting sign-in with it
  const verifyClient = await createClient()
  const { error: signInError } = await verifyClient.auth.signInWithPassword({
    email:    user.email,
    password: current_password,
  })

  if (signInError) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
  }

  // Update to new password
  const { error: updateError } = await auth.supabase.auth.updateUser({
    password: new_password,
  })

  if (updateError) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
