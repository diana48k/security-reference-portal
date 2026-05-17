import Link from 'next/link'
import type { ElementType } from 'react'
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Car,
  DoorOpen,
  FileQuestion,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { PortalShell } from '@/src/components/portal-shell'
import { getHomePageData } from '@/src/lib/queries/home'

const iconMap: Record<string, ElementType> = {
  'shield-check': ShieldCheck,
  car: Car,
  columns: DoorOpen,
  'door-open': DoorOpen,
  clock: BookOpen,
}

export default async function HomePage() {
  const { categories, featuredCases, latestCases, faqs } =
    await getHomePageData()

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Secure Solutions / Installation Reference Portal
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 lg:text-4xl">
                ค้นหาเคส ระบบ และแนวทางติดตั้งสำหรับทีมขาย
              </h1>
              <p className="mt-4 leading-7 text-slate-600">
                Workspace กลางสำหรับดูตัวอย่างงานจริง ใช้ประกอบการคุยกับลูกค้า
                และลดการถามซ้ำกับทีมเทคนิค
              </p>
            </div>

            <form
              action="/search"
              className="mt-8 flex max-w-4xl flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  name="q"
                  placeholder="ค้นหา เช่น โรงงาน, Access Control, Flap Barrier, ประตู, อุปกรณ์..."
                  className="h-12 w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                ค้นหาทั้งระบบ
              </button>
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: 'เคสโครงการ',
                  value: latestCases.length,
                  icon: BriefcaseBusiness,
                  href: '/cases',
                },
                {
                  label: 'เคสแนะนำ',
                  value: featuredCases.length,
                  icon: Star,
                  href: '/search?featured=true',
                },
                {
                  label: 'FAQ',
                  value: faqs.length,
                  icon: FileQuestion,
                  href: '/faq',
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-bold text-slate-950">
                        {item.value.toLocaleString('th-TH')}
                      </div>
                    </div>
                    <div className="mt-3 text-sm font-bold text-slate-700">
                      {item.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-bold">พื้นที่ทำงานสำหรับทีมขาย</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              เปิดเคสจริง ดูรูปก่อน/หลัง ดาวน์โหลดสรุป และเข้าถึง FAQ ได้ในที่เดียว
              เหมาะกับการใช้งานทุกวันในทีมขาย
            </p>
            <Link
              href="/search?hasImages=true"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              ดูเคสที่มีรูปจริง
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                หมวดระบบด่วน
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                หมวดระบบหลัก
              </h2>
            </div>
            <Link
              href="/categories"
              className="text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              ดูหมวดทั้งหมด
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category) => {
              const Icon = iconMap[category.icon ?? ''] ?? ShieldCheck

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-950">{category.name_th}</h3>
                  {category.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {category.description}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-700">
                    เปิดหมวดนี้
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                เคสแนะนำ
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                เคสแนะนำสำหรับใช้ขายงาน
              </h2>
            </div>
            <Link
              href="/search?featured=true"
              className="text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              ดูทั้งหมด
            </Link>
          </div>

          {featuredCases.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredCases.map((caseStudy) => (
                <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              ยังไม่มีเคสแนะนำ
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  เคสล่าสุด
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  งานติดตั้งล่าสุด
                </h2>
              </div>
              <Link
                href="/cases"
                className="text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                เคสโครงการ
              </Link>
            </div>

            {latestCases.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {latestCases.slice(0, 4).map((caseStudy) => (
                  <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                ยังไม่มีเคสในระบบ
              </div>
            )}
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  FAQ
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  คำถามที่เซลถามบ่อย
                </h2>
              </div>
              <Link href="/faq" className="text-sm font-bold text-blue-700">
                ดูทั้งหมด
              </Link>
            </div>

            {faqs.length > 0 ? (
              <div className="space-y-3">
                {faqs.slice(0, 5).map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <h3 className="font-bold text-slate-950">{faq.question}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                ยังไม่มี FAQ
              </div>
            )}
          </aside>
        </section>
      </div>
    </PortalShell>
  )
}
