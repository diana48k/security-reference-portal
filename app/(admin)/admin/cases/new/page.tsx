import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { AdminCaseForm } from '@/src/components/admin-case-form'
import { getCaseFormOptions } from '@/src/lib/queries/admin-cases'

export default async function AdminNewCasePage() {
  const { categories, siteTypes, doorTypes, systemTypes } =
    await getCaseFormOptions()

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-sm">
        <Link
          href="/admin/cases"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับรายการเคส
        </Link>

        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          New Case Study
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          เพิ่มเคสงานติดตั้งใหม่
        </h1>

        <p className="mt-3 max-w-2xl text-slate-300">
          กรอกข้อมูลเคสงานติดตั้งจริง เพื่อให้ทีมเซลใช้ค้นหา เปิดให้ลูกค้าดู
          และใช้เป็น reference ตอนพรีเซ้นท์งาน
        </p>
      </section>

      <AdminCaseForm
        categories={categories}
        siteTypes={siteTypes}
        doorTypes={doorTypes}
        systemTypes={systemTypes}
      />
    </div>
  )
}
