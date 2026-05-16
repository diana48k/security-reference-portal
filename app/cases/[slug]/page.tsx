import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Users,
} from 'lucide-react'

import { CaseActions } from '@/src/components/case-actions'
import { CaseGallery } from '@/src/components/case-gallery'
import {
  formatBudget,
  formatThaiDate,
  getCaseDocumentUrl,
  sortBySortOrder,
} from '@/src/lib/case-utils'
import { getCaseDetail, type CaseLookup } from '@/src/lib/queries/case-detail'

type CaseDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: CaseDetailPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  if (!caseDetail) {
    return {
      title: 'ไม่พบเคส',
    }
  }

  return {
    title: `${caseDetail.title} | Security Reference Portal`,
    description: caseDetail.subtitle ?? caseDetail.customer_visible_notes ?? undefined,
  }
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  if (!caseDetail) {
    notFound()
  }

  const visibleNotes =
    caseDetail.customer_visible_notes ??
    caseDetail.solution_statement ??
    caseDetail.requirement_summary
  const documents = sortBySortOrder(caseDetail.case_documents).filter((document) =>
    getCaseDocumentUrl(document),
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {caseDetail.categories ? (
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {caseDetail.categories.name_th}
                  </span>
                ) : null}
                {caseDetail.site_types ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {caseDetail.site_types.name_th}
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-950 lg:text-6xl">
                {caseDetail.title}
              </h1>

              {caseDetail.subtitle ? (
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                  {caseDetail.subtitle}
                </p>
              ) : null}
            </div>

            <CaseActions slug={caseDetail.slug} title={caseDetail.title} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-10">
          <CaseGallery images={caseDetail.case_images} title={caseDetail.title} />

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8">
            <h2 className="text-2xl font-bold text-slate-950">
              ภาพรวมงานติดตั้ง
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {caseDetail.problem_statement ? (
                <div>
                  <h3 className="font-semibold text-slate-950">
                    ปัญหาหรือโจทย์งาน
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {caseDetail.problem_statement}
                  </p>
                </div>
              ) : null}

              {caseDetail.requirement_summary ? (
                <div>
                  <h3 className="font-semibold text-slate-950">
                    ความต้องการหลัก
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {caseDetail.requirement_summary}
                  </p>
                </div>
              ) : null}

              {caseDetail.solution_statement ? (
                <div>
                  <h3 className="font-semibold text-slate-950">
                    แนวทางที่ติดตั้ง
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {caseDetail.solution_statement}
                  </p>
                </div>
              ) : null}

              {caseDetail.installation_notes ? (
                <div>
                  <h3 className="font-semibold text-slate-950">
                    หมายเหตุงานติดตั้ง
                  </h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {caseDetail.installation_notes}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          {documents.length > 0 ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-950">
                เอกสารประกอบ
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {documents.map((document) => {
                  const documentUrl = getCaseDocumentUrl(document)

                  if (!documentUrl) return null

                  return (
                    <a
                      key={document.id}
                      href={documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-semibold text-slate-950">
                              {document.file_name ?? document.kind.toUpperCase()}
                            </h3>
                            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-950" />
                          </div>
                          {document.description ? (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {document.description}
                            </p>
                          ) : null}
                          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {document.kind}
                          </p>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          ) : null}

          {visibleNotes ? (
            <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm lg:p-8">
              <h2 className="text-2xl font-bold">
                ข้อความสำหรับใช้พรีเซนต์ลูกค้า
              </h2>
              <p className="mt-4 leading-8 text-slate-200">{visibleNotes}</p>
            </section>
          ) : null}

          {caseDetail.faqs.length > 0 ? (
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8">
              <h2 className="text-2xl font-bold text-slate-950">FAQ</h2>
              <div className="mt-5 space-y-4">
                {caseDetail.faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <h3 className="font-semibold text-slate-950">
                      {faq.question}
                    </h3>
                    <p className="mt-2 leading-7 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-bold text-slate-950">ข้อมูลสรุป</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {caseDetail.location ? (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <dt className="font-semibold text-slate-950">สถานที่</dt>
                    <dd className="mt-1 text-slate-600">{caseDetail.location}</dd>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <dt className="font-semibold text-slate-950">วันที่ติดตั้ง</dt>
                  <dd className="mt-1 text-slate-600">
                    {formatThaiDate(caseDetail.installed_at)}
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <dt className="font-semibold text-slate-950">ระยะเวลา</dt>
                  <dd className="mt-1 text-slate-600">
                    {caseDetail.installation_days
                      ? `${caseDetail.installation_days} วัน`
                      : 'ไม่ระบุ'}
                  </dd>
                </div>
              </div>

              <div className="flex gap-3">
                <Users className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <dt className="font-semibold text-slate-950">จำนวนผู้ใช้งาน</dt>
                  <dd className="mt-1 text-slate-600">
                    {caseDetail.user_count
                      ? `${caseDetail.user_count.toLocaleString('th-TH')} คน`
                      : 'ไม่ระบุ'}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl bg-slate-100 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Budget
              </div>
              <div className="mt-1 font-bold text-slate-950">
                {formatBudget(caseDetail.budget_min, caseDetail.budget_max)}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-bold text-slate-950">ระบบที่เกี่ยวข้อง</h2>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {[caseDetail.door_types, caseDetail.system_types, ...caseDetail.tags]
                .filter((item): item is CaseLookup => Boolean(item))
                .map((item) => (
                  <span
                    key={item.slug}
                    className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"
                  >
                    {item.name_th}
                  </span>
                ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}
