import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type AdminFaq = {
  id: string
  question: string
  answer: string
  category_id: string | null
  case_id: string | null
  is_global: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  categories: { name_th: string; slug: string } | null
  case_studies: { title: string; slug: string } | null
}

export type AdminFaqCategoryOption = {
  id: string
  name_th: string
}

export type AdminFaqCaseOption = {
  id: string
  title: string
  slug: string
}

type RawAdminFaq = Omit<AdminFaq, 'categories' | 'case_studies'> & {
  categories: { name_th: string; slug: string } | { name_th: string; slug: string }[] | null
  case_studies: { title: string; slug: string } | { title: string; slug: string }[] | null
}

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function normalizeFaq(faq: RawAdminFaq): AdminFaq {
  return {
    ...faq,
    categories: firstRelation(faq.categories),
    case_studies: firstRelation(faq.case_studies),
  }
}

export async function getAdminFaqPageData() {
  const supabase = await createSupabaseServerClient()

  const [faqs, categories, cases] = await Promise.all([
    supabase
      .from('faqs')
      .select(`
        id,
        question,
        answer,
        category_id,
        case_id,
        is_global,
        is_active,
        sort_order,
        created_at,
        categories (
          name_th,
          slug
        ),
        case_studies (
          title,
          slug
        )
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),

    supabase
      .from('categories')
      .select('id, name_th')
      .order('sort_order', { ascending: true }),

    supabase
      .from('case_studies')
      .select('id, title, slug')
      .order('created_at', { ascending: false }),
  ])

  if (faqs.error) throw new Error(faqs.error.message)
  if (categories.error) throw new Error(categories.error.message)
  if (cases.error) throw new Error(cases.error.message)

  return {
    faqs: ((faqs.data ?? []) as unknown as RawAdminFaq[]).map(normalizeFaq),
    categories: (categories.data ?? []) as AdminFaqCategoryOption[],
    cases: (cases.data ?? []) as AdminFaqCaseOption[],
  }
}
