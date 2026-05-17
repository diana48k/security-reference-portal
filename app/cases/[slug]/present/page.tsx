import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, History, ShieldCheck } from 'lucide-react'

import { BrandLogo } from '@/src/components/brand-logo'
import { PresentationActions } from '@/src/components/presentation-actions'
import {
  formatBudget,
  formatThaiDate,
  getCaseImageUrl,
  getPrimaryCaseImage,
} from '@/src/lib/case-utils'
import { getCaseDetail } from '@/src/lib/queries/case-detail'

type PresentationPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PresentationPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  return {
    title: caseDetail ? `Sales Deck: ${caseDetail.title}` : 'ไม่พบเคส',
  }
}

export default async function CasePresentationPage({ params }: PresentationPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  if (!caseDetail) {
    notFound()
  }

  const primaryImage = getPrimaryCaseImage(caseDetail.case_images)
  const primaryImageUrl = primaryImage ? getCaseImageUrl(primaryImage) : null

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={`/cases/${caseDetail.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white print:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับหน้าเคส
            </Link>
            <BrandLogo tone="light" />
          </div>
          <PresentationActions title={caseDetail.title} />
        </div>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {caseDetail.categories ? (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950">
                  {caseDetail.categories.name_th}
                </span>
              ) : null}
              {caseDetail.site_types ? (
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold text-slate-200">
                  {caseDetail.site_types.name_th}
                </span>
              ) : null}
            </div>

            <h1 className="text-5xl font-bold tracking-tight lg:text-7xl">
              {caseDetail.title}
            </h1>
            {caseDetail.subtitle ? (
              <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-300">
                {caseDetail.subtitle}
              </p>
            ) : null}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  label: 'ควบคุมการเข้าออก',
                },
                {
                  icon: History,
                  label: 'ตรวจสอบย้อนหลังได้',
                },
                {
                  icon: Building2,
                  label: 'เหมาะกับโรงงาน/ออฟฟิศ',
                },
              ].map((benefit) => {
                const Icon = benefit.icon

                return (
                  <div
                    key={benefit.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold text-white"
                  >
                    <Icon className="h-5 w-5 text-red-300" />
                    {benefit.label}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="presentation-budget rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                <div className="text-sm text-slate-400">งบประมาณ</div>
                <div className="mt-2 font-bold">
                  {formatBudget(caseDetail.budget_min, caseDetail.budget_max)}
                </div>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                <div className="text-sm text-slate-400">ระยะเวลา</div>
                <div className="mt-2 font-bold">
                  {caseDetail.installation_days
                    ? `${caseDetail.installation_days} วัน`
                    : 'ไม่ระบุ'}
                </div>
              </div>
              <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                <div className="text-sm text-slate-400">วันที่ติดตั้ง</div>
                <div className="mt-2 font-bold">
                  {formatThaiDate(caseDetail.installed_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-white/10 ring-1 ring-white/10">
            {primaryImageUrl ? (
              <div className="relative aspect-[16/11]">
                <Image
                  src={primaryImageUrl}
                  alt={primaryImage?.caption ?? caseDetail.title}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/11] items-center justify-center text-slate-400">
                ยังไม่มีรูปตัวอย่าง
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 pb-10 lg:grid-cols-3">
          {caseDetail.problem_statement ? (
            <div className="rounded-3xl bg-white p-6 text-slate-950">
              <h2 className="font-bold">โจทย์งาน</h2>
              <p className="mt-3 leading-7 text-slate-600">
                {caseDetail.problem_statement}
              </p>
            </div>
          ) : null}
          {caseDetail.solution_statement ? (
            <div className="rounded-3xl bg-white p-6 text-slate-950">
              <h2 className="font-bold">แนวทางติดตั้ง</h2>
              <p className="mt-3 leading-7 text-slate-600">
                {caseDetail.solution_statement}
              </p>
            </div>
          ) : null}
          {caseDetail.customer_visible_notes ? (
            <div className="rounded-3xl bg-white p-6 text-slate-950">
              <h2 className="font-bold">ข้อความสำหรับลูกค้า</h2>
              <p className="mt-3 leading-7 text-slate-600">
                {caseDetail.customer_visible_notes}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
