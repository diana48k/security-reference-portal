import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type AdminProfile = {
  id: string
  full_name: string | null
  role: string | null
}

export type AdminDashboardStats = {
  totalCases: number
  publishedCases: number
  draftCases: number
  categories: number
  faqs: number
}

export async function getCurrentAdminUser() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  const profile = data as AdminProfile | null

  if (profileError || !profile) {
    redirect('/')
  }

  if (!profile.role || !['admin', 'tech'].includes(profile.role)) {
    redirect('/')
  }

  return {
    user,
    profile,
  }
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createSupabaseServerClient()

  const [totalCases, publishedCases, draftCases, categories, faqs] =
    await Promise.all([
      supabase.from('case_studies').select('id', {
        count: 'exact',
        head: true,
      }),

      supabase
        .from('case_studies')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),

      supabase
        .from('case_studies')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft'),

      supabase.from('categories').select('id', {
        count: 'exact',
        head: true,
      }),

      supabase.from('faqs').select('id', {
        count: 'exact',
        head: true,
      }),
    ])

  const firstError =
    totalCases.error ??
    publishedCases.error ??
    draftCases.error ??
    categories.error ??
    faqs.error

  if (firstError) {
    throw new Error(firstError.message)
  }

  return {
    totalCases: totalCases.count ?? 0,
    publishedCases: publishedCases.count ?? 0,
    draftCases: draftCases.count ?? 0,
    categories: categories.count ?? 0,
    faqs: faqs.count ?? 0,
  }
}
