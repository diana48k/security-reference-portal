import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import {
  CASE_SELECT,
  normalizeCase,
  type HomeCase,
  type HomeLookup,
  type RawHomeCase,
} from '@/src/lib/queries/home'

export type SearchParamsInput = Record<string, string | string[] | undefined>

export type SearchFilters = {
  q: string
  category: string
  siteType: string
  doorType: string
  systemType: string
  budget: string
  featured: boolean
  hasImages: boolean
}

export type SearchOption = HomeLookup

export type SearchFilterOptions = {
  categories: SearchOption[]
  siteTypes: SearchOption[]
  doorTypes: SearchOption[]
  systemTypes: SearchOption[]
}

export type SearchPageData = {
  filters: SearchFilters
  options: SearchFilterOptions
  cases: HomeCase[]
}

type LookupTable = 'categories' | 'site_types' | 'door_types' | 'system_types'

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function booleanParam(value: string | string[] | undefined) {
  return firstParam(value) === 'true'
}

function normalizeFilters(params: SearchParamsInput): SearchFilters {
  return {
    q: firstParam(params.q).trim(),
    category: firstParam(params.category),
    siteType: firstParam(params.siteType),
    doorType: firstParam(params.doorType),
    systemType: firstParam(params.systemType),
    budget: firstParam(params.budget),
    featured: booleanParam(params.featured),
    hasImages: booleanParam(params.hasImages),
  }
}

function escapeSearchValue(value: string) {
  return value.replaceAll('%', '\\%').replaceAll('_', '\\_').replaceAll(',', ' ')
}

async function getLookupId(table: LookupTable, slug: string) {
  if (!slug) return null

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.id ?? null
}

async function getOptions(): Promise<SearchFilterOptions> {
  const supabase = await createSupabaseServerClient()

  const [categories, siteTypes, doorTypes, systemTypes] = await Promise.all([
    supabase
      .from('categories')
      .select('slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('site_types')
      .select('slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('door_types')
      .select('slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('system_types')
      .select('slug, name_th, name_en')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  for (const result of [categories, siteTypes, doorTypes, systemTypes]) {
    if (result.error) {
      throw new Error(result.error.message)
    }
  }

  return {
    categories: (categories.data ?? []) as SearchOption[],
    siteTypes: (siteTypes.data ?? []) as SearchOption[],
    doorTypes: (doorTypes.data ?? []) as SearchOption[],
    systemTypes: (systemTypes.data ?? []) as SearchOption[],
  }
}

export async function getSearchPageData(
  params: SearchParamsInput,
): Promise<SearchPageData> {
  const filters = normalizeFilters(params)
  const supabase = await createSupabaseServerClient()

  const [options, categoryId, siteTypeId, doorTypeId, systemTypeId] =
    await Promise.all([
      getOptions(),
      getLookupId('categories', filters.category),
      getLookupId('site_types', filters.siteType),
      getLookupId('door_types', filters.doorType),
      getLookupId('system_types', filters.systemType),
    ])

  let query = supabase
    .from('case_studies')
    .select(CASE_SELECT)
    .eq('status', 'published')

  if (filters.q) {
    const pattern = `%${escapeSearchValue(filters.q)}%`
    query = query.or(
      [
        `title.ilike.${pattern}`,
        `subtitle.ilike.${pattern}`,
        `location.ilike.${pattern}`,
        `problem_statement.ilike.${pattern}`,
        `requirement_summary.ilike.${pattern}`,
        `solution_statement.ilike.${pattern}`,
        `customer_visible_notes.ilike.${pattern}`,
      ].join(','),
    )
  }

  if (categoryId) query = query.eq('category_id', categoryId)
  if (siteTypeId) query = query.eq('site_type_id', siteTypeId)
  if (doorTypeId) query = query.eq('door_type_id', doorTypeId)
  if (systemTypeId) query = query.eq('primary_system_type_id', systemTypeId)
  if (filters.featured) query = query.eq('is_featured', true)

  const budget = Number(filters.budget)
  if (Number.isFinite(budget) && budget > 0) {
    query = query.or(`budget_min.is.null,budget_min.lte.${budget}`)
  }

  const { data, error } = await query
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(60)

  if (error) {
    throw new Error(error.message)
  }

  let cases = ((data ?? []) as unknown as RawHomeCase[]).map(normalizeCase)

  if (filters.hasImages) {
    cases = cases.filter((caseStudy) =>
      caseStudy.case_images?.some((image) => image.image_url ?? image.storage_path),
    )
  }

  return {
    filters,
    options,
    cases,
  }
}
