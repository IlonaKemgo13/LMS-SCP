import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const {
      id,
      fullName,
      email,
      role,
    } = body

    if (!id || !fullName || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    /* UPDATE AUTH USER */

    const { error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(
        id,
        {
          email,
          user_metadata: {
            full_name: fullName,
            role,
          },
        }
      )

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    /* UPDATE PROFILE */

    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          full_name: fullName,
          email,
          role,
        })
        .eq("id", id)

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
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