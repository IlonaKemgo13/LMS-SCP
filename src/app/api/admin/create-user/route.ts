import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { fullName, email, password, role } = body

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // CREATE AUTH USER
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (authError) {
      console.error(authError)

      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      )
    }

    // INSERT PROFILE
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        role,
      })

    if (profileError) {
      console.error(profileError)

      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}