import 'server-only'

import { getCurrentAdminUser } from '@/src/lib/queries/admin'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import type { ManagedUser, UserRole } from '@/src/types/application'

type ProfileRow = { id: string; full_name: string | null; role: UserRole; is_active: boolean; must_change_password: boolean; created_at: string; updated_at: string }

export async function getManagedUsers(): Promise<ManagedUser[]> {
  await getCurrentAdminUser()
  const admin = createSupabaseAdminClient()
  const [{ data: authData, error: authError }, { data: profileData, error: profileError }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, full_name, role, is_active, must_change_password, created_at, updated_at'),
  ])
  if (authError) throw new Error(authError.message)
  if (profileError) throw new Error(profileError.message)
  const profiles = new Map(((profileData ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]))
  return authData.users.map((user) => {
    const profile = profiles.get(user.id)
    return {
      id: user.id, email: user.email ?? '',
      fullName: profile?.full_name ?? (typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : null),
      role: profile?.role ?? (user.app_metadata.role as UserRole | undefined) ?? 'viewer',
      isActive: profile?.is_active ?? !user.banned_until,
      mustChangePassword: profile?.must_change_password ?? false,
      createdAt: profile?.created_at ?? user.created_at,
      updatedAt: profile?.updated_at ?? user.updated_at ?? user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
    }
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
