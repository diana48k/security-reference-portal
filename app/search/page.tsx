import Link from 'next/link'
import { Search } from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { PortalShell } from '@/src/components/portal-shell'
import { SearchFilterForm } from '@/src/components/search-filter-form'
import {
  getSearchPageData,
  type SearchParamsInput,
} from '@/src/lib/queries/search'

type SearchPageProps = {
  searchParams: Promise<SearchParamsInput>
}

export const metadata = {
  title: 'Search Cases',
  description: 'ค้นหาและกรองเคสงานติดตั้งจาก Supabase',
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const data = await getSearchPageData(await searchParams)
  const hasFilters = Object.values(data.filters).some((value) => Boolean(value))

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex max-w-4xl items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Case Finder
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                ค้นหาเคสสำหรับใช้ขายงาน
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                ค้นหาจาก keyword และกรองตามหมวดระบบ ประเภทสถานที่ ประตู ระบบ
                งบประมาณ เคสแนะนำ หรือเคสที่มีรูปจริง
              </p>
            </div>
          </div>
        </section>

        <SearchFilterForm filters={data.filters} options={data.options} />

        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Results
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                พบ {data.cases.length.toLocaleString('th-TH')} เคส
              </h2>
            </div>

            {hasFilters ? (
              <Link
                href="/search"
                className="text-sm font-bold text-blue-700 transition hover:text-blue-800"
              >
                ดูเคสทั้งหมด
              </Link>
            ) : null}
          </div>

          {data.cases.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {data.cases.map((caseStudy) => (
                <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="font-bold text-slate-950">
                ยังไม่พบเคสที่ตรงกับเงื่อนไข
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                ลองลดตัวกรองบางรายการ หรือค้นหาด้วยคำกว้างขึ้น เช่น โรงงาน,
                Access Control, LPR
              </p>
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  )
}
