import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/src/lib/supabase/config'

export type HomeCategory = {
  id: string
  slug: string
  name_th: string
  name_en: string | null
  description: string | null
  icon: string | null
}

export type HomeLookup = {
  slug: string
  name_th: string
  name_en: string | null
}

export type HomeCaseImage = {
  image_url: string | null
  storage_path: string | null
  kind: string
  caption: string | null
  sort_order: number | null
}

export type HomeCase = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  status?: string
  location: string | null
  budget_min: number | null
  budget_max: number | null
  installation_days: number | null
  is_featured?: boolean
  published_at: string | null
  categories: HomeLookup | null
  site_types: HomeLookup | null
  door_types: HomeLookup | null
  system_types: HomeLookup | null
  case_images: HomeCaseImage[] | null
}

export type HomeFaq = {
  id: string
  question: string
  answer: string
}

export type HomePageData = {
  categories: HomeCategory[]
  featuredCases: HomeCase[]
  latestCases: HomeCase[]
  faqs: HomeFaq[]
}

export type RawHomeCase = Omit<
  HomeCase,
  'categories' | 'site_types' | 'door_types' | 'system_types'
> & {
  categories: HomeLookup | HomeLookup[] | null
  site_types: HomeLookup | HomeLookup[] | null
  door_types: HomeLookup | HomeLookup[] | null
  system_types: HomeLookup | HomeLookup[] | null
}

export const CASE_SELECT = `
  id,
  slug,
  title,
  subtitle,
  status,
  location,
  budget_min,
  budget_max,
  installation_days,
  is_featured,
  published_at,
  categories (
    slug,
    name_th,
    name_en
  ),
  site_types (
    slug,
    name_th,
    name_en
  ),
  door_types (
    slug,
    name_th,
    name_en
  ),
  system_types (
    slug,
    name_th,
    name_en
  ),
  case_images (
    image_url,
    storage_path,
    kind,
    caption,
    sort_order
  )
`

export function firstRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

export function normalizeCase(caseStudy: RawHomeCase): HomeCase {
  return {
    ...caseStudy,
    categories: firstRelation(caseStudy.categories),
    site_types: firstRelation(caseStudy.site_types),
    door_types: firstRelation(caseStudy.door_types),
    system_types: firstRelation(caseStudy.system_types),
  }
}

export async function getHomePageData(): Promise<HomePageData> {
  const emptyData: HomePageData = {
    categories: [],
    featuredCases: [],
    latestCases: [],
    faqs: [],
  }

  if (!hasSupabasePublicConfig()) {
    console.error('Supabase environment variables are missing.')
    return emptyData
  }

  const supabase = await createSupabaseServerClient()

  try {
    const [categoriesResult, featuredCasesResult, latestCasesResult, faqsResult] =
      await Promise.all([
        supabase
          .from('categories')
          .select('id, slug, name_th, name_en, description, icon')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),

        supabase
          .from('case_studies')
          .select(CASE_SELECT)
          .eq('status', 'published')
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(3),

        supabase
          .from('case_studies')
          .select(CASE_SELECT)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(8),

        supabase
          .from('faqs')
          .select('id, question, answer')
          .eq('is_active', true)
          .eq('is_global', true)
          .order('sort_order', { ascending: true })
          .limit(6),
      ])

    if (categoriesResult.error) {
      throw new Error(categoriesResult.error.message)
    }

    if (featuredCasesResult.error) {
      throw new Error(featuredCasesResult.error.message)
    }

    if (latestCasesResult.error) {
      throw new Error(latestCasesResult.error.message)
    }

    if (faqsResult.error) {
      throw new Error(faqsResult.error.message)
    }

    const featuredCases = ((featuredCasesResult.data ?? []) as unknown as RawHomeCase[]).map(
      normalizeCase,
    )
    const latestCases = ((latestCasesResult.data ?? []) as unknown as RawHomeCase[]).map(
      normalizeCase,
    )

    return {
      categories: (categoriesResult.data ?? []) as HomeCategory[],
      featuredCases,
      latestCases,
      faqs: (faqsResult.data ?? []) as HomeFaq[],
    }
  } catch (error) {
    console.error('Unable to load home page data.', error)
    return emptyData
  }
}
