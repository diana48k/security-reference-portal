import Link from 'next/link'
import { ArrowRight, FileText, Newspaper, Star } from 'lucide-react'

import { PortalShell } from '@/src/components/portal-shell'
import { formatThaiDate } from '@/src/lib/case-utils'
import { getPublishedDocuments } from '@/src/lib/queries/documents'
import { getHomePageData } from '@/src/lib/queries/home'

export const metadata = {
  title: 'ข่าวสาร / อัปเดต',
}

export default async function NewsPage() {
  const [{ latestCases, featuredCases }, documents] = await Promise.all([
    getHomePageData(),
    getPublishedDocuments(),
  ])

  const updates = [
    ...featuredCases.slice(0, 3).map((caseStudy) => ({
      id: `featured-${caseStudy.id}`,
      label: 'เคสแนะนำ',
      title: caseStudy.title,
      description: caseStudy.subtitle ?? caseStudy.location ?? 'เคสที่ทีมขายควรหยิบไปใช้อ้างอิง',
      href: `/cases/${caseStudy.slug}`,
      date: caseStudy.published_at,
      icon: Star,
    })),
    ...latestCases.slice(0, 5).map((caseStudy) => ({
      id: `case-${caseStudy.id}`,
      label: 'เคสเผยแพร่ล่าสุด',
      title: caseStudy.title,
      description: caseStudy.subtitle ?? caseStudy.location ?? 'เคสงานติดตั้งที่เผยแพร่ในระบบ',
      href: `/cases/${caseStudy.slug}`,
      date: caseStudy.published_at,
      icon: Newspaper,
    })),
    ...documents.slice(0, 4).map((document) => ({
      id: `document-${document.id}`,
      label: 'เอกสารใหม่',
      title: document.file_name ?? document.description ?? 'เอกสารประกอบเคส',
      description: document.case_studies?.title ?? document.kind,
      href: '/documents',
      date: document.created_at,
      icon: FileText,
    })),
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0

    return dateB - dateA
  })

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Newspaper className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                News
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                ข่าวสาร / อัปเดต
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                รวมความเคลื่อนไหวจากคลังเคสและเอกสารล่าสุด เพื่อให้ทีมขายรู้ว่าอะไรเพิ่งถูกเพิ่มหรือควรหยิบไปใช้
              </p>
            </div>
          </div>
        </section>

        {updates.length > 0 ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {updates.slice(0, 10).map((update) => {
              const Icon = update.icon

              return (
                <Link
                  key={update.id}
                  href={update.href}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                          {update.label}
                        </span>
                        <span className="text-slate-400">
                          {formatThaiDate(update.date)}
                        </span>
                      </div>
                      <h2 className="mt-3 line-clamp-2 font-bold text-slate-950 group-hover:text-blue-700">
                        {update.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {update.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                  </div>
                </Link>
              )
            })}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Newspaper className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              ยังไม่มีอัปเดต
            </h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
              เมื่อมีเคสหรือเอกสารเผยแพร่ ระบบจะนำมาแสดงในหน้านี้อัตโนมัติ
            </p>
          </section>
        )}
      </div>
    </PortalShell>
  )
}
