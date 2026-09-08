import { createClient } from '@supabase/supabase-js'

// This client uses the service_role key — it bypasses RLS.
// NEVER import this file into anything that runs in the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}