import { NextResponse } from "next/server"
import { requireAuth, validationError } from "@/lib/api-helpers"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  createUserSchema,
  updateUserSchema,
  disableUserSchema,
} from "@/lib/validations"

export async function POST(req: Request) {
  const auth = await requireAuth("admin")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { fullName, email, password, role } = parsed.data
  const admin = createAdminClient()

  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    full_name: fullName,
    email,
    role,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const auth = await requireAuth("admin")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { id, fullName, email, role } = parsed.data
  const admin = createAdminClient()

  const { error: authError } = await admin.auth.admin.updateUserById(id, {
    email,
    user_metadata: { full_name: fullName, role },
    // Re-enabling via PATCH must lift a previous disable-ban, and setting
    // role to "disabled" here should ban the same as DELETE does.
    ban_duration: role === "disabled" ? "876000h" : "none",
  })
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, email, role })
    .eq("id", id)

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const auth = await requireAuth("admin")
  if (!auth.ok) return auth.response

  const body = await req.json()
  const parsed = disableUserSchema.safeParse(body)
  if (!parsed.success) return validationError(parsed.error.issues)

  const { id } = parsed.data
  const admin = createAdminClient()

  // Ban at the auth level so the user's existing session stops working
  // immediately, instead of relying solely on the profile role flag.
  const { error: authError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: "876000h",
  })
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const { error } = await admin
    .from("profiles")
    .update({ role: "disabled" })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
