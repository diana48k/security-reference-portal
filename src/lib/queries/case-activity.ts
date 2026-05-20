import { redirect } from 'next/navigation'

import {
  CASE_SELECT,
  normalizeCase,
  type HomeCase,
  type RawHomeCase,
} from '@/src/lib/queries/home'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type FavoriteCase = {
  favoritedAt: string
  caseStudy: HomeCase
}

export type RecentCase = {
  viewedAt: string
  caseStudy: HomeCase
}

type RawFavoriteCase = {
  created_at: string
  case_studies: RawHomeCase | RawHomeCase[] | null
}

type RawRecentCase = {
  viewed_at: string
  case_studies: RawHomeCase | RawHomeCase[] | null
}

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null

  return relation
}

async function getRequiredUserId(nextPath: string) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  return user.id
}

export async function getFavoriteCases(): Promise<FavoriteCase[]> {
  const userId = await getRequiredUserId('/favorites')
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_case_favorites')
    .select(
      `
        created_at,
        case_studies (
          ${CASE_SELECT}
        )
      `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as RawFavoriteCase[]).flatMap((item) => {
    const caseStudy = firstRelation(item.case_studies)

    if (!caseStudy || caseStudy.status === 'archived') return []

    return {
      favoritedAt: item.created_at,
      caseStudy: normalizeCase(caseStudy),
    }
  })
}

export async function getRecentCases(): Promise<RecentCase[]> {
  const userId = await getRequiredUserId('/recent')
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('user_case_views')
    .select(
      `
        viewed_at,
        case_studies (
          ${CASE_SELECT}
        )
      `,
    )
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(30)

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as RawRecentCase[]).flatMap((item) => {
    const caseStudy = firstRelation(item.case_studies)

    if (!caseStudy || caseStudy.status === 'archived') return []

    return {
      viewedAt: item.viewed_at,
      caseStudy: normalizeCase(caseStudy),
    }
  })
}
