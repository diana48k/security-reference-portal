import 'server-only'

import { createClient } from '@supabase/supabase-js'

import { getSupabasePublicConfigOrThrow } from '@/src/lib/supabase/config'

export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicConfigOrThrow()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
