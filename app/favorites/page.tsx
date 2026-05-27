import Link from 'next/link'
import { Search, Star } from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { PortalShell } from '@/src/components/portal-shell'
import { getFavoriteCases } from '@/src/lib/queries/case-activity'

export const metadata = {
  title: 'รายการโปรดของฉัน',
}

export default async function FavoritesPage() {
  const favorites = await getFavoriteCases()

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-600">
              <Star className="h-4 w-4 fill-current" />
              Favorites
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
              รายการโปรดของฉัน
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              เคสที่บันทึกไว้สำหรับหยิบใช้ซ้ำเวลาคุยกับลูกค้า หรือใช้เป็นตัวอย่างอ้างอิงในงานขาย
            </p>
          </div>
          <Link
            href="/search"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            <Search className="h-4 w-4" />
            ค้นหาเคสเพิ่ม
          </Link>
        </section>

        {favorites.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <CaseCard key={item.caseStudy.id} caseStudy={item.caseStudy} />
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Star className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              ยังไม่มีรายการโปรด
            </h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
              เปิดหน้าเคสแล้วกด “บันทึกเป็นรายการโปรด” เพื่อเก็บเคสที่ใช้บ่อยไว้ที่นี่
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
