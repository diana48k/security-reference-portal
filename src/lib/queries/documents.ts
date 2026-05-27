import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { hasSupabasePublicConfig } from '@/src/lib/supabase/config'

export type DocumentCaseLookup = {
  title: string
  slug: string
  status?: string
  categories: { name_th: string; slug: string } | null
}

export type PortalDocument = {
  id: string
  case_id: string
  kind: string
  file_url: string | null
  storage_path: string | null
  file_name: string | null
  description: string | null
  sort_order: number | null
  created_at: string
  case_studies: DocumentCaseLookup | null
}

type RawPortalDocument = Omit<PortalDocument, 'case_studies'> & {
  case_studies:
    | (Omit<DocumentCaseLookup, 'categories'> & {
        categories:
          | { name_th: string; slug: string }
          | { name_th: string; slug: string }[]
          | null
      })
    | Array<
        Omit<DocumentCaseLookup, 'categories'> & {
          categories:
            | { name_th: string; slug: string }
            | { name_th: string; slug: string }[]
            | null
        }
      >
    | null
}

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null

  return relation
}

function normalizeDocument(document: RawPortalDocument): PortalDocument {
  const caseStudy = firstRelation(document.case_studies)

  return {
    ...document,
    case_studies: caseStudy
      ? {
          ...caseStudy,
          categories: firstRelation(caseStudy.categories),
        }
      : null,
  }
}

export async function getPublishedDocuments(): Promise<PortalDocument[]> {
  if (!hasSupabasePublicConfig()) {
    console.error('Supabase environment variables are missing.')
    return []
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('case_documents')
    .select(
      `
        id,
        case_id,
        kind,
        file_url,
        storage_path,
        file_name,
        description,
        sort_order,
        created_at,
        case_studies (
          title,
          slug,
          categories (
            name_th,
            slug
          )
        )
      `,
    )
    .order('created_at', { ascending: false })
    .limit(80)

  if (error) {
    console.error('Unable to load published documents.', error)
    return []
  }

  return ((data ?? []) as unknown as RawPortalDocument[])
    .map(normalizeDocument)
    .filter((document) => Boolean(document.case_studies))
}

export async function getAdminDocuments(): Promise<PortalDocument[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('case_documents')
    .select(
      `
        id,
        case_id,
        kind,
        file_url,
        storage_path,
        file_name,
        description,
        sort_order,
        created_at,
        case_studies (
          title,
          slug,
          status,
          categories (
            name_th,
            slug
          )
        )
      `,
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as RawPortalDocument[]).map(normalizeDocument)
}
