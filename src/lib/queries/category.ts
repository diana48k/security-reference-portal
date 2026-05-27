import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/src/lib/supabase/config'
import {
  CASE_SELECT,
  normalizeCase,
  type HomeCase,
  type HomeCategory,
  type RawHomeCase,
} from '@/src/lib/queries/home'

export type CategoryPageData = {
  category: HomeCategory
  relatedCategories: HomeCategory[]
  cases: HomeCase[]
}

export async function getCategoryPageData(
  slug: string,
): Promise<CategoryPageData | null> {
  if (!hasSupabasePublicConfig()) {
    console.error('Supabase environment variables are missing.')
    return null
  }

  const supabase = await createSupabaseServerClient()

  const [categoryResult, relatedCategoriesResult] = await Promise.all([
    supabase
      .from('categories')
      .select('id, slug, name_th, name_en, description, icon')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('id, slug, name_th, name_en, description, icon')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  if (categoryResult.error) {
    console.error('Unable to load category.', categoryResult.error)
    return null
  }

  if (relatedCategoriesResult.error) {
    console.error('Unable to load related categories.', relatedCategoriesResult.error)
    return null
  }

  if (!categoryResult.data) {
    return null
  }

  const casesResult = await supabase
    .from('case_studies')
    .select(CASE_SELECT)
    .eq('status', 'published')
    .eq('category_id', categoryResult.data.id)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })

  if (casesResult.error) {
    console.error('Unable to load category cases.', casesResult.error)
    return null
  }

  return {
    category: categoryResult.data as HomeCategory,
    relatedCategories: (relatedCategoriesResult.data ?? []) as HomeCategory[],
    cases: ((casesResult.data ?? []) as unknown as RawHomeCase[]).map(normalizeCase),
  }
}
