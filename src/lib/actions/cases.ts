'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentAdminUser } from '@/src/lib/queries/admin'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

const CASE_STATUSES = ['draft', 'published', 'archived'] as const
const IMAGE_KINDS = ['before', 'after', 'gallery', 'diagram'] as const
const DOCUMENT_KINDS = [
  'pdf',
  'drawing',
  'spec',
  'brochure',
  'quotation_example',
  'other',
] as const

type CaseStatus = (typeof CASE_STATUSES)[number]
type ImageKind = (typeof IMAGE_KINDS)[number]
type DocumentKind = (typeof DOCUMENT_KINDS)[number]

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

function parseImageKind(value: FormDataEntryValue | null): ImageKind {
  const kind = String(value ?? 'gallery')

  if (IMAGE_KINDS.includes(kind as ImageKind)) {
    return kind as ImageKind
  }

  return 'gallery'
}

function parseDocumentKind(value: FormDataEntryValue | null): DocumentKind {
  const kind = String(value ?? 'other')

  if (DOCUMENT_KINDS.includes(kind as DocumentKind)) {
    return kind as DocumentKind
  }

  return 'other'
}

function parseSortOrder(value: FormDataEntryValue | null) {
  return parseNumber(value) ?? 0
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'upload'
}

function getUploadedFile(formData: FormData, fieldName = 'file') {
  const file = formData.get(fieldName)

  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Please choose a file to upload.')
  }

  return file
}

function buildCasePayload(formData: FormData, userId: string) {
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

  return {
    payload: {
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
      updated_by: userId,
    },
    slug,
  }
}

function revalidateCasePaths(slug?: string | null) {
  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath('/admin')
  revalidatePath('/admin/cases')

  if (slug) {
    revalidatePath(`/cases/${slug}`)
  }
}

async function getExistingCase(id: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('case_studies')
    .select('id, slug, status, published_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('Case not found.')
  }

  return data as {
    id: string
    slug: string
    status: CaseStatus
    published_at: string | null
  }
}

export async function createCaseStudyAction(formData: FormData) {
  const { user } = await getCurrentAdminUser()
  const supabase = await createSupabaseServerClient()
  const { payload, slug } = buildCasePayload(formData, user.id)

  const { error } = await supabase.from('case_studies').insert({
    ...payload,
    created_by: user.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidateCasePaths(slug)
  redirect('/admin/cases')
}

export async function updateCaseStudyAction(formData: FormData) {
  const { user } = await getCurrentAdminUser()
  const supabase = await createSupabaseServerClient()
  const id = String(formData.get('id') ?? '')

  if (!id) {
    throw new Error('Case id is required.')
  }

  const existingCase = await getExistingCase(id)
  const { payload, slug } = buildCasePayload(formData, user.id)
  const publishedAt =
    payload.status === 'published'
      ? existingCase.published_at ?? new Date().toISOString()
      : null

  const { error } = await supabase
    .from('case_studies')
    .update({
      ...payload,
      published_at: publishedAt,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidateCasePaths(existingCase.slug)
  revalidateCasePaths(slug)
  redirect('/admin/cases')
}

export async function updateCaseStatusAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const id = String(formData.get('id') ?? '')
  const status = parseStatus(formData.get('status'))

  if (!id) {
    throw new Error('Case id is required.')
  }

  const existingCase = await getExistingCase(id)
  const publishedAt =
    status === 'published'
      ? existingCase.published_at ?? new Date().toISOString()
      : null

  const { error } = await supabase
    .from('case_studies')
    .update({
      status,
      published_at: publishedAt,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidateCasePaths(existingCase.slug)
  redirect(`/admin/cases/${id}`)
}

export async function deleteCaseStudyAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const id = String(formData.get('id') ?? '')

  if (!id) {
    throw new Error('Case id is required.')
  }

  const existingCase = await getExistingCase(id)
  const { error } = await supabase.from('case_studies').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidateCasePaths(existingCase.slug)
  redirect('/admin/cases')
}

export async function uploadCaseImageAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const caseId = String(formData.get('case_id') ?? '')
  const file = getUploadedFile(formData)
  const kind = parseImageKind(formData.get('kind'))

  if (!caseId) {
    throw new Error('Case id is required.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file.')
  }

  const existingCase = await getExistingCase(caseId)
  const storagePath = `${caseId}/${Date.now()}-${sanitizeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage
    .from('case-images')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('case-images').getPublicUrl(storagePath)

  const { error: insertError } = await supabase.from('case_images').insert({
    case_id: caseId,
    kind,
    image_url: publicUrl,
    storage_path: storagePath,
    caption: String(formData.get('caption') ?? '').trim() || null,
    alt_text: String(formData.get('alt_text') ?? '').trim() || null,
    sort_order: parseSortOrder(formData.get('sort_order')),
  })

  if (insertError) {
    await supabase.storage.from('case-images').remove([storagePath])
    throw new Error(insertError.message)
  }

  revalidateCasePaths(existingCase.slug)
  redirect(`/admin/cases/${caseId}`)
}

export async function uploadCaseDocumentAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const caseId = String(formData.get('case_id') ?? '')
  const file = getUploadedFile(formData)
  const kind = parseDocumentKind(formData.get('kind'))

  if (!caseId) {
    throw new Error('Case id is required.')
  }

  const existingCase = await getExistingCase(caseId)
  const storagePath = `${caseId}/${Date.now()}-${sanitizeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage
    .from('case-documents')
    .upload(storagePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('case-documents').getPublicUrl(storagePath)

  const { error: insertError } = await supabase.from('case_documents').insert({
    case_id: caseId,
    kind,
    file_url: publicUrl,
    storage_path: storagePath,
    file_name: String(formData.get('file_name') ?? '').trim() || file.name,
    description: String(formData.get('description') ?? '').trim() || null,
    sort_order: parseSortOrder(formData.get('sort_order')),
  })

  if (insertError) {
    await supabase.storage.from('case-documents').remove([storagePath])
    throw new Error(insertError.message)
  }

  revalidateCasePaths(existingCase.slug)
  redirect(`/admin/cases/${caseId}`)
}

export async function deleteCaseImageAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const imageId = String(formData.get('image_id') ?? '')

  if (!imageId) {
    throw new Error('Image id is required.')
  }

  const { data: image, error: imageError } = await supabase
    .from('case_images')
    .select('id, case_id, storage_path, case_studies (slug)')
    .eq('id', imageId)
    .maybeSingle()

  if (imageError) {
    throw new Error(imageError.message)
  }

  if (!image) {
    throw new Error('Image not found.')
  }

  const imageRecord = image as unknown as {
    case_id: string
    storage_path: string | null
    case_studies: { slug: string } | { slug: string }[] | null
  }

  const { error: deleteError } = await supabase
    .from('case_images')
    .delete()
    .eq('id', imageId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (imageRecord.storage_path) {
    await supabase.storage.from('case-images').remove([imageRecord.storage_path])
  }

  const relation = Array.isArray(imageRecord.case_studies)
    ? imageRecord.case_studies[0]
    : imageRecord.case_studies

  revalidateCasePaths(relation?.slug)
  redirect(`/admin/cases/${imageRecord.case_id}`)
}

export async function deleteCaseDocumentAction(formData: FormData) {
  await getCurrentAdminUser()

  const supabase = await createSupabaseServerClient()
  const documentId = String(formData.get('document_id') ?? '')

  if (!documentId) {
    throw new Error('Document id is required.')
  }

  const { data: document, error: documentError } = await supabase
    .from('case_documents')
    .select('id, case_id, storage_path, case_studies (slug)')
    .eq('id', documentId)
    .maybeSingle()

  if (documentError) {
    throw new Error(documentError.message)
  }

  if (!document) {
    throw new Error('Document not found.')
  }

  const documentRecord = document as unknown as {
    case_id: string
    storage_path: string | null
    case_studies: { slug: string } | { slug: string }[] | null
  }

  const { error: deleteError } = await supabase
    .from('case_documents')
    .delete()
    .eq('id', documentId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (documentRecord.storage_path) {
    await supabase.storage
      .from('case-documents')
      .remove([documentRecord.storage_path])
  }

  const relation = Array.isArray(documentRecord.case_studies)
    ? documentRecord.case_studies[0]
    : documentRecord.case_studies

  revalidateCasePaths(relation?.slug)
  redirect(`/admin/cases/${documentRecord.case_id}`)
}
