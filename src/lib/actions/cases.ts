'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentAdminUser } from '@/src/lib/queries/admin'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

const CASE_STATUSES = ['draft', 'published', 'archived'] as const

type CaseStatus = (typeof CASE_STATUSES)[number]

function createSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseNumber(value: FormDataEntryValue | null) {
  if (!value) return null

  const text = String(value).trim()
  if (!text) return null

  const number = Number(text)
  return Number.isNaN(number) ? null : number
}

function parseDate(value: FormDataEntryValue | null) {
  if (!value) return null

  const text = String(value).trim()
  return text || null
}

function parseStatus(value: FormDataEntryValue | null): CaseStatus {
  const status = String(value ?? 'draft')

  if (CASE_STATUSES.includes(status as CaseStatus)) {
    return status as CaseStatus
  }

  return 'draft'
}

export async function createCaseStudyAction(formData: FormData) {
  const { user } = await getCurrentAdminUser()
  const supabase = await createSupabaseServerClient()

  const title = String(formData.get('title') ?? '').trim()
  const customSlug = String(formData.get('slug') ?? '').trim()
  const slug = customSlug ? createSlug(customSlug) : createSlug(title)
  const status = parseStatus(formData.get('status'))

  if (!title) {
    throw new Error('Please enter a case title.')
  }

  if (!slug) {
    throw new Error('Please enter a valid slug or title.')
  }

  const payload = {
    slug,
    title,
    subtitle: String(formData.get('subtitle') ?? '').trim() || null,

    category_id: String(formData.get('category_id') ?? '') || null,
    site_type_id: String(formData.get('site_type_id') ?? '') || null,
    door_type_id: String(formData.get('door_type_id') ?? '') || null,
    primary_system_type_id:
      String(formData.get('primary_system_type_id') ?? '') || null,

    location: String(formData.get('location') ?? '').trim() || null,
    customer_name: String(formData.get('customer_name') ?? '').trim() || null,

    budget_min: parseNumber(formData.get('budget_min')),
    budget_max: parseNumber(formData.get('budget_max')),
    user_count: parseNumber(formData.get('user_count')),
    installation_days: parseNumber(formData.get('installation_days')),
    installed_at: parseDate(formData.get('installed_at')),

    problem_statement:
      String(formData.get('problem_statement') ?? '').trim() || null,
    requirement_summary:
      String(formData.get('requirement_summary') ?? '').trim() || null,
    solution_statement:
      String(formData.get('solution_statement') ?? '').trim() || null,
    installation_notes:
      String(formData.get('installation_notes') ?? '').trim() || null,
    sales_notes: String(formData.get('sales_notes') ?? '').trim() || null,
    tech_notes: String(formData.get('tech_notes') ?? '').trim() || null,
    customer_visible_notes:
      String(formData.get('customer_visible_notes') ?? '').trim() || null,

    status,
    is_featured: formData.get('is_featured') === 'on',
    published_at: status === 'published' ? new Date().toISOString() : null,

    created_by: user.id,
    updated_by: user.id,
  }

  const { error } = await supabase.from('case_studies').insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath(`/cases/${slug}`)
  revalidatePath('/admin')
  revalidatePath('/admin/cases')

  redirect('/admin/cases')
}
