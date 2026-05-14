import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getCaseDetailBySlug(slug: string) {
  const supabase = await createSupabaseServerClient()

  const { data: caseStudy, error } = await supabase
    .from('case_studies')
    .select(`
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
      tech_notes,
      customer_visible_notes,
      status,
      is_featured,
      published_at,
      category_id,
      site_type_id,
      door_type_id,
      primary_system_type_id,
      categories (
        id,
        slug,
        name_th,
        name_en,
        description
      ),
      site_types (
        id,
        slug,
        name_th,
        name_en
      ),
      door_types (
        id,
        slug,
        name_th,
        name_en
      ),
      system_types (
        id,
        slug,
        name_th,
        name_en
      ),
      case_images (
        id,
        kind,
        image_url,
        caption,
        alt_text,
        sort_order
      ),
      case_documents (
        id,
        kind,
        file_url,
        file_name,
        description,
        sort_order
      ),
      case_tags (
        tags (
          id,
          slug,
          name_th,
          name_en
        )
      ),
      faqs (
        id,
        question,
        answer,
        sort_order
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !caseStudy) {
    notFound()
  }

  const { data: relatedCases, error: relatedError } = await supabase
    .from('case_studies')
    .select(`
      id,
      slug,
      title,
      subtitle,
      location,
      budget_min,
      budget_max,
      installation_days,
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
        image_url,
        kind,
        caption,
        sort_order
      )
    `)
    .eq('status', 'published')
    .neq('id', caseStudy.id)
    .or(
      [
        caseStudy.category_id ? `category_id.eq.${caseStudy.category_id}` : '',
        caseStudy.site_type_id ? `site_type_id.eq.${caseStudy.site_type_id}` : '',
        caseStudy.door_type_id ? `door_type_id.eq.${caseStudy.door_type_id}` : '',
        caseStudy.primary_system_type_id
          ? `primary_system_type_id.eq.${caseStudy.primary_system_type_id}`
          : '',
      ]
        .filter(Boolean)
        .join(',')
    )
    .limit(3)

  if (relatedError) {
    throw new Error(relatedError.message)
  }

  return {
    caseStudy,
    relatedCases: relatedCases ?? [],
  }
}