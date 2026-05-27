const FALLBACK_SUPABASE_URL = 'https://jmjkdslxtpmixrvydbgl.supabase.co'
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_fE5xofJ9TljCVbV7ox8CbA_3hLI7Ptf'

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    FALLBACK_SUPABASE_PUBLISHABLE_KEY

  return { url, key }
}

export function hasSupabasePublicConfig() {
  const { url, key } = getSupabasePublicConfig()

  return Boolean(url && key)
}

export function getSupabasePublicConfigOrThrow() {
  const { url, key } = getSupabasePublicConfig()

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).',
    )
  }

  return { url, key }
}
