import { Tags } from 'lucide-react'

import { AdminTaxonomySection } from '@/src/components/admin-taxonomy-section'
import { getAdminTaxonomyPageData } from '@/src/lib/queries/admin-taxonomy'

export const metadata = {
  title: 'จัดการหมวดระบบ',
}

export default async function AdminTaxonomyPage() {
  const sections = await getAdminTaxonomyPageData()

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
            <Tags className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              จัดการหมวดระบบ
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              จัดการตัวกรองและป้ายกำกับ
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              เพิ่มและแก้ไขหมวดระบบ ประเภทสถานที่ ประเภทประตู ประเภทระบบ
              และแท็กที่ใช้ในหน้าค้นหาและฟอร์มเคส
            </p>
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <AdminTaxonomySection key={section.table} section={section} />
      ))}
    </div>
  )
}
