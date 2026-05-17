import Link from 'next/link'
import { ArrowRight, Tags } from 'lucide-react'

import { PortalShell } from '@/src/components/portal-shell'
import { getHomePageData } from '@/src/lib/queries/home'

export const metadata = {
  title: 'หมวดระบบ',
}

export default async function CategoriesPage() {
  const { categories } = await getHomePageData()

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Tags className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                หมวดระบบ
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                หมวดระบบทั้งหมด
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                เลือกหมวดระบบเพื่อดูตัวอย่างเคสและ reference ที่เกี่ยวข้อง
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {category.name_th}
                  </h2>
                  {category.name_en ? (
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {category.name_en}
                    </p>
                  ) : null}
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
              </div>
              {category.description ? (
                <p className="mt-4 line-clamp-3 leading-7 text-slate-600">
                  {category.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </PortalShell>
  )
}
