'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentAdminUser } from '@/src/lib/queries/admin'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

const TAXONOMY_TABLES = [
  'categories',
  'site_types',
  'door_types',
  'system_types',
  'tags',
] as const

type TaxonomyTable = (typeof TAXONOMY_TABLES)[number]

function parseTable(value: FormDataEntryValue | null): TaxonomyTable {
  const table = String(value ?? '')

  if (TAXONOMY_TABLES.includes(table as TaxonomyTable)) {
    return table as TaxonomyTable
  }

  throw new Error('Invalid taxonomy table.')
}

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

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\u0E00-\u0E7Fa-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function revalidateTaxonomyPaths() {
  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath('/admin/taxonomy')
  revalidatePath('/admin/cases/new')
}

function buildPayload(table: TaxonomyTable, formData: FormData) {
  const nameTh = textValue(formData.get('name_th'))
  const slugInput = textValue(formData.get('slug'))
  const slug = slugInput ? slugify(slugInput) : nameTh ? slugify(nameTh) : null

  if (!nameTh || !slug) {
    throw new Error('Name and slug are required.')
  }

  const payload: Record<string, string | number | boolean | null> = {
    slug,
    name_th: nameTh,
    name_en: textValue(formData.get('name_en')),
    is_active: formData.get('is_active') === 'on',
  }

  if (table !== 'tags') {
    payload.sort_order = intValue(formData.get('sort_order'))
  }

  if (table === 'categories') {
    payload.description = textValue(formData.get('description'))
    payload.icon = textValue(formData.get('icon'))
  }

  return payload
}

export async function createTaxonomyAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const table = parseTable(formData.get('table'))
  const payload = buildPayload(table, formData)
  const { error } = await supabase.from(table).insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  revalidateTaxonomyPaths()
  redirect('/admin/taxonomy')
}

export async function updateTaxonomyAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const table = parseTable(formData.get('table'))
  const id = textValue(formData.get('id'))

  if (!id) {
    throw new Error('Taxonomy id is required.')
  }

  const payload = buildPayload(table, formData)
  const { error } = await supabase.from(table).update(payload).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidateTaxonomyPaths()
  redirect('/admin/taxonomy')
}

export async function deleteTaxonomyAction(formData: FormData) {
  return deactivateTaxonomyAction(formData)
}

export async function deactivateTaxonomyAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const table = parseTable(formData.get('table'))
  const id = textValue(formData.get('id'))

  if (!id) {
    throw new Error('Taxonomy id is required.')
  }

  const { error } = await supabase
    .from(table)
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidateTaxonomyPaths()
  redirect('/admin/taxonomy')
}

export async function activateTaxonomyAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const table = parseTable(formData.get('table'))
  const id = textValue(formData.get('id'))

  if (!id) {
    throw new Error('Taxonomy id is required.')
  }

  const { error } = await supabase
    .from(table)
    .update({ is_active: true })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidateTaxonomyPaths()
  redirect('/admin/taxonomy')
}
