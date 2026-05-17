import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { SiteFooter } from '@/src/components/site-footer'
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

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Category
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 lg:text-5xl">
                {data.category.name_th}
              </h1>
              {data.category.description ? (
                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  {data.category.description}
                </p>
              ) : null}
            </div>

            <Link
              href={`/search?category=${data.category.slug}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              ค้นหาในหมวดนี้
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Cases
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                พบ {data.cases.length.toLocaleString('th-TH')} เคสในหมวดนี้
              </h2>
            </div>

            {data.cases.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
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

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:self-start">
            <h2 className="font-bold text-slate-950">หมวดระบบอื่น</h2>
            <div className="mt-4 space-y-2">
              {data.relatedCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    category.slug === data.category.slug
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span>{category.name_th}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
