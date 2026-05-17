import Link from 'next/link'
import type { ElementType } from 'react'
import {
  ArrowRight,
  BookOpen,
  Car,
  DoorOpen,
  Search,
  ShieldCheck,
} from 'lucide-react'

import { BrandLogo } from '@/src/components/brand-logo'
import { CaseCard } from '@/src/components/case-card'
import { SiteFooter } from '@/src/components/site-footer'
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
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-4xl">
            <div className="mb-8">
              <BrandLogo tone="light" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
              คู่มือกลางสำหรับทีมเซล ดูตัวอย่างงานติดตั้งจริงได้ทันที
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              ค้นหาเคสงาน Access Control, Time Attendance, Carpark, Flap Barrier,
              Swing Gate และระบบอื่น ๆ เพื่อใช้พรีเซนต์ลูกค้า ลดการถามซ้ำกับทีมเทคนิค
              และช่วยปิดการขายด้วยภาพงานจริง
            </p>

            <form
              action="/search"
              className="mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  name="q"
                  placeholder="ค้นหา เช่น ประตูกระจก, โรงงาน, carpark, flap barrier..."
                  className="h-12 w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                ค้นหาเคส
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                เปิดหน้า Search/Filter
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/search?featured=true&hasImages=true"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                ดูเคสแนะนำที่มีรูปจริง
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quick Categories
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              หมวดระบบหลัก
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = iconMap[category.icon ?? ''] ?? ShieldCheck

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="font-semibold text-slate-950">
                  {category.name_th}
                </h3>

                {category.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {category.description}
                  </p>
                ) : null}

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-950">
                  ดูหมวดนี้
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Featured Cases
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              เคสแนะนำสำหรับใช้ขายงาน
            </h2>
          </div>

          <Link
            href="/search?featured=true"
            className="hidden items-center gap-2 text-sm font-semibold text-slate-950 sm:flex"
          >
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredCases.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCases.map((caseStudy) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            ยังไม่มีเคสแนะนำ
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Latest Cases
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              งานติดตั้งล่าสุด
            </h2>
          </div>

          <Link
            href="/search"
            className="hidden items-center gap-2 text-sm font-semibold text-slate-950 sm:flex"
          >
            ค้นหาเพิ่มเติม
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latestCases.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {latestCases.map((caseStudy) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            ยังไม่มีเคสในระบบ
          </div>
        )}
      </section>

      {faqs.length > 0 ? (
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                FAQ
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                คำถามที่เซลถามบ่อย
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="font-semibold text-slate-950">
                    {faq.question}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  )
}
