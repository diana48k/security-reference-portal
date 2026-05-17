import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type TaxonomyTable =
  | 'categories'
  | 'site_types'
  | 'door_types'
  | 'system_types'
  | 'tags'

export type AdminTaxonomyItem = {
  id: string
  slug: string
  name_th: string
  name_en: string | null
  description?: string | null
  icon?: string | null
  sort_order?: number
  is_active: boolean
  created_at: string
}

export type AdminTaxonomySectionData = {
  table: TaxonomyTable
  title: string
  description: string
  supportsCategoryFields: boolean
  supportsSortOrder: boolean
  items: AdminTaxonomyItem[]
}

async function getItems(table: TaxonomyTable) {
  const supabase = await createSupabaseServerClient()
  const select =
    table === 'categories'
      ? 'id, slug, name_th, name_en, description, icon, sort_order, is_active, created_at'
      : table === 'tags'
        ? 'id, slug, name_th, name_en, is_active, created_at'
        : 'id, slug, name_th, name_en, sort_order, is_active, created_at'

  let query = supabase.from(table).select(select)

  if (table !== 'tags') {
    query = query.order('sort_order', { ascending: true })
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown) as AdminTaxonomyItem[]
}

export async function getAdminTaxonomyPageData(): Promise<
  AdminTaxonomySectionData[]
> {
  const [categories, siteTypes, doorTypes, systemTypes, tags] =
    await Promise.all([
      getItems('categories'),
      getItems('site_types'),
      getItems('door_types'),
      getItems('system_types'),
      getItems('tags'),
    ])

  return [
    {
      table: 'categories',
      title: 'หมวดระบบ',
      description: 'หมวดหลักที่ใช้ในหน้าหลัก หน้า Search และหน้าเคส',
      supportsCategoryFields: true,
      supportsSortOrder: true,
      items: categories,
    },
    {
      table: 'site_types',
      title: 'ประเภทสถานที่',
      description: 'ตัวกรองประเภทหน้างาน เช่น ออฟฟิศ โรงงาน หรือคลังสินค้า',
      supportsCategoryFields: false,
      supportsSortOrder: true,
      items: siteTypes,
    },
    {
      table: 'door_types',
      title: 'ประเภทประตู',
      description: 'ตัวกรองรูปแบบประตู ทางเข้า หรือ gate',
      supportsCategoryFields: false,
      supportsSortOrder: true,
      items: doorTypes,
    },
    {
      table: 'system_types',
      title: 'ประเภทระบบ',
      description: 'ตัวกรองระบบหลักทางเทคนิค',
      supportsCategoryFields: false,
      supportsSortOrder: true,
      items: systemTypes,
    },
    {
      table: 'tags',
      title: 'แท็ก',
      description: 'ป้ายกำกับที่ใช้จัดกลุ่มเคส',
      supportsCategoryFields: false,
      supportsSortOrder: false,
      items: tags,
    },
  ]
}
