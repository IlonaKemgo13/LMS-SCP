import { createClient } from "@/lib/supabase/client"

export async function getCurrentProfile() {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { user: null, profile: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single()

  if (profileError) {
    return { user, profile: null }
  }

  return { user, profile }
}