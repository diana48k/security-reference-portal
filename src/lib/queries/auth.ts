import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import type { PortalUser, UserRole } from '@/src/types/application'

export type ActiveProfile = {
  id: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  must_change_password: boolean
}

export async function getOptionalPortalUser(): Promise<PortalUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims

  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return null

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active, must_change_password')
    .eq('id', userId)
    .maybeSingle()

  const profile = profileData as ActiveProfile | null
  if (!profile?.is_active) return null

  if (profile.must_change_password) {
    redirect('/account/change-password?required=1')
  }

  return {
    id: userId,
    fullName: profile.full_name,
    email: typeof claims?.email === 'string' ? claims.email : null,
    role: profile.role,
  }
}

export async function getRequiredActiveUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active, must_change_password')
    .eq('id', user.id)
    .maybeSingle()

  const profile = data as ActiveProfile | null
  if (!profile?.is_active) redirect('/login?error=inactive')

  return { profile, supabase, user }
}
