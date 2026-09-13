'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/src/lib/supabase/server'

async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}

function getCasePath(slug: string) {
  return `/cases/${slug}`
}

export async function recordCaseViewAction(caseId: string, slug?: string) {
  if (!caseId) return null

  const supabase = await createSupabaseServerClient()
  const userId = await getCurrentUserId()

  const { error: incrementError } = await supabase.rpc('increment_case_view', {
    p_case_id: caseId,
  })

  if (incrementError) {
    console.error('Unable to record case view.', incrementError)
    return null
  }

  const { data: updatedCase, error: viewCountError } = await supabase
    .from('case_studies')
    .select('view_count')
    .eq('id', caseId)
    .maybeSingle()

  if (viewCountError) {
    console.error('Unable to load updated case view count.', viewCountError)
  }

  if (slug) {
    revalidatePath(getCasePath(slug))
  }

  if (!userId) {
    return updatedCase?.view_count ?? null
  }

  await supabase.from('user_case_views').upsert(
    {
      user_id: userId,
      case_id: caseId,
      viewed_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,case_id',
    },
  )

  revalidatePath('/recent')
  return updatedCase?.view_count ?? null
}

export async function toggleFavoriteAction({
  caseId,
  slug,
  nextFavorite,
}: {
  caseId: string
  slug: string
  nextFavorite: boolean
}) {
  const userId = await getCurrentUserId()

  if (!userId) {
    redirect(`/login?next=${encodeURIComponent(getCasePath(slug))}`)
  }

  const supabase = await createSupabaseServerClient()

  if (nextFavorite) {
    const { error } = await supabase.from('user_case_favorites').upsert(
      {
        user_id: userId,
        case_id: caseId,
      },
      {
        onConflict: 'user_id,case_id',
      },
    )

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('user_case_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('case_id', caseId)

    if (error) throw new Error(error.message)
  }

  revalidatePath('/favorites')
  revalidatePath(getCasePath(slug))
}

export async function submitCaseFeedbackAction({
  caseId,
  slug,
  isUseful,
}: {
  caseId: string
  slug: string
  isUseful: boolean
}) {
  const userId = await getCurrentUserId()

  if (!userId) {
    redirect(`/login?next=${encodeURIComponent(getCasePath(slug))}`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('user_case_feedback').upsert(
    {
      user_id: userId,
      case_id: caseId,
      is_useful: isUseful,
    },
    {
      onConflict: 'user_id,case_id',
    },
  )

  if (error) throw new Error(error.message)

  revalidatePath(getCasePath(slug))
}
