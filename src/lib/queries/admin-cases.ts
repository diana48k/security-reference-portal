import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type AdminCaseLookup = {
  name_th: string
  slug: string
}

export type AdminCase = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  status: string
  is_featured: boolean
  location: string | null
  budget_min: number | null
  budget_max: number | null
  installation_days: number | null
  published_at: string | null
  created_at: string
  categories: AdminCaseLookup | null
  site_types: AdminCaseLookup | null
  door_types: AdminCaseLookup | null
  system_types: AdminCaseLookup | null
}

export type CaseFormOption = {
  id: string
  slug: string
  name_th: string
  name_en: string | null
}

type RawAdminCase = Omit<
  AdminCase,
  'categories' | 'site_types' | 'door_types' | 'system_types'
> & {
  categories: AdminCaseLookup | AdminCaseLookup[] | null
  site_types: AdminCaseLookup | AdminCaseLookup[] | null
  door_types: AdminCaseLookup | AdminCaseLookup[] | null
  system_types: AdminCaseLookup | AdminCaseLookup[] | null
}

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function normalizeAdminCase(caseStudy: RawAdminCase): AdminCase {
  return {
    ...caseStudy,
    categories: firstRelation(caseStudy.categories),
    site_types: firstRelation(caseStudy.site_types),
    door_types: firstRelation(caseStudy.door_types),
    system_types: firstRelation(caseStudy.system_types),
  }
}

export async function getAdminCases(): Promise<AdminCase[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      id,
      slug,
      title,
      subtitle,
      status,
      is_featured,
      location,
      budget_min,
      budget_max,
      installation_days,
      published_at,
      created_at,
      categories (
        name_th,
        slug
      ),
      site_types (
        name_th,
        slug
      ),
      door_types (
        name_th,
        slug
      ),
      system_types (
        name_th,
        slug
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown as RawAdminCase[]).map(normalizeAdminCase)
}

export async function getCaseFormOptions() {
  const supabase = await createSupabaseServerClient()

  const [categories, siteTypes, doorTypes, systemTypes] = await Promise.all([
    supabase
      .from('categories')
      .select('id, slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),

    supabase
      .from('site_types')
      .select('id, slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),

    supabase
      .from('door_types')
      .select('id, slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),

    supabase
      .from('system_types')
      .select('id, slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  if (categories.error) throw new Error(categories.error.message)
  if (siteTypes.error) throw new Error(siteTypes.error.message)
  if (doorTypes.error) throw new Error(doorTypes.error.message)
  if (systemTypes.error) throw new Error(systemTypes.error.message)

  return {
    categories: (categories.data ?? []) as CaseFormOption[],
    siteTypes: (siteTypes.data ?? []) as CaseFormOption[],
    doorTypes: (doorTypes.data ?? []) as CaseFormOption[],
    systemTypes: (systemTypes.data ?? []) as CaseFormOption[],
  }
}
