import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { getSupabasePublicConfigOrThrow } from '@/src/lib/supabase/config'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const { url, key } = getSupabasePublicConfigOrThrow()

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components cannot always write cookies.
            // Middleware will handle session refresh.
          }
        },
      },
    }
  )
}

export const createClient = createSupabaseServerClient
