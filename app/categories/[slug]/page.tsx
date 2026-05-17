import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Tags } from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { PortalShell } from '@/src/components/portal-shell'
import { getCategoryPageData } from '@/src/lib/queries/category'

type CategoryPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const data = await getCategoryPageData(slug)

  if (!data) {
    return {
      title: 'ไม่พบหมวดระบบ',
    }
  }

  return {
    title: data.category.name_th,
    description: data.category.description ?? undefined,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const data = await getCategoryPageData(slug)

  if (!data) {
    notFound()
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Tags className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  Category
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                  {data.category.name_th}
                </h1>
                {data.category.description ? (
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    {data.category.description}
                  </p>
                ) : null}
              </div>
            </div>

            <Link
              href={`/search?category=${data.category.slug}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              ค้นหาในหมวดนี้
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Cases
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                พบ {data.cases.length.toLocaleString('th-TH')} เคสในหมวดนี้
              </h2>
            </div>

            {data.cases.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {data.cases.map((caseStudy) => (
                  <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
                ยังไม่มีเคสในหมวดนี้
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:self-start">
            <h2 className="font-bold text-slate-950">หมวดระบบอื่น</h2>
            <div className="mt-4 space-y-2">
              {data.relatedCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition ${
                    category.slug === data.category.slug
                      ? 'bg-blue-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>{category.name_th}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </PortalShell>
  )
}
