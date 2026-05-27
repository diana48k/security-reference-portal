import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type AdminUserProfile = {
  id: string
  full_name: string | null
  role: string
  created_at: string
  updated_at: string
}

export async function getAdminUserProfiles(): Promise<AdminUserProfile[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []) as AdminUserProfile[]
}
