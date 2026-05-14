import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { SearchFilterForm } from '@/src/components/search-filter-form'
import {
  getSearchPageData,
  type SearchParamsInput,
} from '@/src/lib/queries/search'

type SearchPageProps = {
  searchParams: Promise<SearchParamsInput>
}

export const metadata = {
  title: 'Search Cases | Security Reference Portal',
  description: 'ค้นหาและกรองเคสงานติดตั้งจาก Supabase',
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const data = await getSearchPageData(await searchParams)
  const hasFilters = Object.values(data.filters).some((value) => Boolean(value))

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>

          <div className="mt-8 flex max-w-4xl items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Case Finder
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
                ค้นหาเคสสำหรับใช้ขายงาน
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                ค้นหาจาก keyword และกรองตามหมวดระบบ ประเภทสถานที่ ประตู ระบบ งบประมาณ เคสแนะนำ หรือเคสที่มีรูปจริง
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <SearchFilterForm filters={data.filters} options={data.options} />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Results
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              พบ {data.cases.length.toLocaleString('th-TH')} เคส
            </h2>
          </div>

          {hasFilters ? (
            <Link
              href="/search"
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              ดูเคสทั้งหมด
            </Link>
          ) : null}
        </div>

        {data.cases.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {data.cases.map((caseStudy) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="font-bold text-slate-950">ยังไม่พบเคสที่ตรงกับเงื่อนไข</h3>
            <p className="mt-2 text-sm text-slate-600">
              ลองลดตัวกรองบางรายการ หรือค้นหาด้วยคำกว้างขึ้น เช่น โรงงาน, Access Control, LPR
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
