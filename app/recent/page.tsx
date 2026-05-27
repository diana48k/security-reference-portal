import Link from 'next/link'
import { Clock3, Search } from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { PortalShell } from '@/src/components/portal-shell'
import { formatThaiDate } from '@/src/lib/case-utils'
import { getRecentCases } from '@/src/lib/queries/case-activity'

export const metadata = {
  title: 'ดูล่าสุด',
}

export default async function RecentPage() {
  const recentCases = await getRecentCases()

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-blue-700">
              <Clock3 className="h-4 w-4" />
              Recent
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
              ดูล่าสุด
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              ประวัติเคสที่คุณเพิ่งเปิดดู เรียงจากล่าสุด เพื่อกลับไปหยิบข้อมูลต่อได้เร็ว
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            <Search className="h-4 w-4" />
            ค้นหาเคส
          </Link>
        </section>

        {recentCases.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentCases.map((item) => (
              <div key={item.caseStudy.id} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  เปิดดูล่าสุด: {formatThaiDate(item.viewedAt)}
                </div>
                <CaseCard caseStudy={item.caseStudy} />
              </div>
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Clock3 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              ยังไม่มีประวัติการเปิดดู
            </h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
              เมื่อคุณเปิดหน้าเคส ระบบจะบันทึกไว้ที่นี่เพื่อให้กลับมาดูต่อได้ง่าย
            </p>
            <Link
              href="/cases"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              ดูเคสโครงการ
            </Link>
          </section>
        )}
      </div>
    </PortalShell>
  )
}
