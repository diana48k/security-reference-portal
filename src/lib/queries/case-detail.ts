import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type CaseLookup = {
  slug: string
  name_th: string
  name_en: string | null
}

export type CaseDetailImage = {
  id: string
  kind: 'before' | 'after' | 'gallery' | 'diagram' | string
  image_url: string | null
  storage_path: string | null
  caption: string | null
  alt_text: string | null
  sort_order: number | null
}

export type CaseDetailDocument = {
  id: string
  kind: string
  file_url: string | null
  storage_path: string | null
  file_name: string | null
  description: string | null
  sort_order: number | null
}

export type CaseDetailTag = {
  slug: string
  name_th: string
  name_en: string | null
}

export type CaseDetailFaq = {
  id: string
  question: string
  answer: string
  is_active: boolean
  sort_order: number | null
}

export type CaseDetail = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  location: string | null
  customer_name: string | null
  budget_min: number | null
  budget_max: number | null
  user_count: number | null
  installation_days: number | null
  installed_at: string | null
  problem_statement: string | null
  requirement_summary: string | null
  solution_statement: string | null
  installation_notes: string | null
  sales_notes: string | null
  customer_visible_notes: string | null
  view_count: number | null
  is_favorited: boolean
  can_favorite: boolean
  published_at: string | null
  categories: CaseLookup | null
  site_types: CaseLookup | null
  door_types: CaseLookup | null
  system_types: CaseLookup | null
  case_images: CaseDetailImage[]
  case_documents: CaseDetailDocument[]
  faqs: CaseDetailFaq[]
  tags: CaseDetailTag[]
}

type RawCaseTag = {
  tags: CaseDetailTag | CaseDetailTag[] | null
}

type RawCaseDetail = Omit<
  CaseDetail,
  | 'categories'
  | 'site_types'
  | 'door_types'
  | 'system_types'
  | 'case_images'
  | 'case_documents'
  | 'faqs'
  | 'tags'
  | 'is_favorited'
  | 'can_favorite'
> & {
  categories: CaseLookup | CaseLookup[] | null
  site_types: CaseLookup | CaseLookup[] | null
  door_types: CaseLookup | CaseLookup[] | null
  system_types: CaseLookup | CaseLookup[] | null
  case_images: CaseDetailImage[] | null
  case_documents: CaseDetailDocument[] | null
  faqs: CaseDetailFaq[] | null
  case_tags: RawCaseTag[] | null
}

const CASE_DETAIL_SELECT = `
  id,
  slug,
  title,
  subtitle,
  location,
  customer_name,
  budget_min,
  budget_max,
  user_count,
  installation_days,
  installed_at,
  problem_statement,
  requirement_summary,
  solution_statement,
  installation_notes,
  sales_notes,
  customer_visible_notes,
  view_count,
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
    id,
    kind,
    image_url,
    storage_path,
    caption,
    alt_text,
    sort_order
  ),
  case_documents (
    id,
    kind,
    file_url,
    storage_path,
    file_name,
    description,
    sort_order
  ),
  faqs (
    id,
    question,
    answer,
    is_active,
    sort_order
  ),
  case_tags (
    tags (
      slug,
      name_th,
      name_en
    )
  )
`

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function normalizeCaseDetail(
  caseDetail: RawCaseDetail,
  isFavorited: boolean,
  canFavorite: boolean,
): CaseDetail {
  return {
    ...caseDetail,
    is_favorited: isFavorited,
    can_favorite: canFavorite,
    categories: firstRelation(caseDetail.categories),
    site_types: firstRelation(caseDetail.site_types),
    door_types: firstRelation(caseDetail.door_types),
    system_types: firstRelation(caseDetail.system_types),
    case_images: caseDetail.case_images ?? [],
    case_documents: caseDetail.case_documents ?? [],
    faqs: (caseDetail.faqs ?? [])
      .filter((faq) => faq.is_active)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    tags: (caseDetail.case_tags ?? [])
      .map((caseTag) => firstRelation(caseTag.tags))
      .filter((tag): tag is CaseDetailTag => Boolean(tag)),
  }
}

export async function getCaseDetail(slug: string): Promise<CaseDetail | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('case_studies')
    .select(CASE_DETAIL_SELECT)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return null
  }

  const caseDetail = data as unknown as RawCaseDetail
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isFavorited = false

  if (user) {
    const { data: favorite, error: favoriteError } = await supabase
      .from('user_case_favorites')
      .select('case_id')
      .eq('user_id', user.id)
      .eq('case_id', caseDetail.id)
      .maybeSingle()

    if (favoriteError) {
      throw new Error(favoriteError.message)
    }

    isFavorited = Boolean(favorite)
  }

  return normalizeCaseDetail(caseDetail, isFavorited, Boolean(user))
}

export async function getCaseSlugs(): Promise<string[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('status', 'published')

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((caseStudy) => caseStudy.slug as string)
}
