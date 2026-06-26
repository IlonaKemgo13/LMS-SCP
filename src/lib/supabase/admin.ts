import { createClient } from "@supabase/supabase-js"

// Service-role client — only import this in admin user-management API routes.
// Never import in client components or non-admin routes.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
