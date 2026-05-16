'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentAdminUser } from '@/src/lib/queries/admin'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

function textValue(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  return text || null
}

function intValue(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  if (!text) return 0

  const number = Number(text)
  return Number.isFinite(number) ? number : 0
}

async function revalidateFaqPaths(caseId?: string | null) {
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/faqs')

  if (!caseId) return

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('id', caseId)
    .maybeSingle()

  if (data?.slug) {
    revalidatePath(`/cases/${data.slug}`)
    revalidatePath(`/cases/${data.slug}/present`)
  }
}

function buildFaqPayload(formData: FormData) {
  const question = textValue(formData.get('question'))
  const answer = textValue(formData.get('answer'))
  const categoryId = textValue(formData.get('category_id'))
  const caseId = textValue(formData.get('case_id'))

  if (!question || !answer) {
    throw new Error('Question and answer are required.')
  }

  return {
    payload: {
      question,
      answer,
      category_id: categoryId,
      case_id: caseId,
      is_global: formData.get('is_global') === 'on',
      is_active: formData.get('is_active') === 'on',
      sort_order: intValue(formData.get('sort_order')),
    },
    caseId,
  }
}

export async function createFaqAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const { payload, caseId } = buildFaqPayload(formData)
  const { error } = await supabase.from('faqs').insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  await revalidateFaqPaths(caseId)
  redirect('/admin/faqs')
}

export async function updateFaqAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const id = textValue(formData.get('id'))

  if (!id) {
    throw new Error('FAQ id is required.')
  }

  const { data: existingFaq } = await supabase
    .from('faqs')
    .select('case_id, case_studies (slug)')
    .eq('id', id)
    .maybeSingle()

  const { payload, caseId } = buildFaqPayload(formData)
  const { error } = await supabase.from('faqs').update(payload).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  const existing = existingFaq as unknown as {
    case_id: string | null
    case_studies: { slug: string } | { slug: string }[] | null
  } | null
  const existingCase = Array.isArray(existing?.case_studies)
    ? existing?.case_studies[0]
    : existing?.case_studies

  await revalidateFaqPaths(caseId)
  if (existing?.case_id && existing.case_id !== caseId) {
    await revalidateFaqPaths(existing.case_id)
  }
  if (existingCase?.slug) {
    revalidatePath(`/cases/${existingCase.slug}`)
  }

  redirect('/admin/faqs')
}

export async function deleteFaqAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const id = textValue(formData.get('id'))

  if (!id) {
    throw new Error('FAQ id is required.')
  }

  const { data: existingFaq } = await supabase
    .from('faqs')
    .select('case_id')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('faqs').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  await revalidateFaqPaths(existingFaq?.case_id ?? null)
  redirect('/admin/faqs')
}
