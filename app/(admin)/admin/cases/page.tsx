import Link from 'next/link'
import { Eye, Plus } from 'lucide-react'

import { formatBudget } from '@/src/lib/case-utils'
import { getAdminCases } from '@/src/lib/queries/admin-cases'

export default async function AdminCasesPage() {
  const cases = await getAdminCases()

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-[2rem] bg-slate-950 p-8 text-white shadow-sm lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Case Studies
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            จัดการเคสงานติดตั้ง
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            เพิ่ม แก้ไข เผยแพร่ หรือซ่อนเคสงานติดตั้งที่ทีมเซลใช้เปิดให้ลูกค้าดู
          </p>
        </div>

        <Link
          href="/admin/cases/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          <Plus className="h-4 w-4" />
          เพิ่มเคสใหม่
        </Link>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            รายการเคสทั้งหมด
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            ทั้งหมด {cases.length.toLocaleString('th-TH')} เคส
          </p>
        </div>

        {cases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">ชื่อเคส</th>
                  <th className="px-6 py-4 font-semibold">หมวด</th>
                  <th className="px-6 py-4 font-semibold">สถานที่</th>
                  <th className="px-6 py-4 font-semibold">ประตู/ระบบ</th>
                  <th className="px-6 py-4 font-semibold">งบประมาณ</th>
                  <th className="px-6 py-4 font-semibold">สถานะ</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {cases.map((caseStudy) => (
                  <tr key={caseStudy.id} className="align-top">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {caseStudy.title}
                        </p>

                        {caseStudy.subtitle ? (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {caseStudy.subtitle}
                          </p>
                        ) : null}

                        <p className="mt-2 text-xs text-slate-400">
                          /cases/{caseStudy.slug}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-700">
                      {caseStudy.categories?.name_th ?? '-'}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-700">
                      <div>{caseStudy.site_types?.name_th ?? '-'}</div>
                      <div className="mt-1 text-slate-500">
                        {caseStudy.location ?? ''}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-700">
                      <div>{caseStudy.door_types?.name_th ?? '-'}</div>
                      <div className="mt-1 text-slate-500">
                        {caseStudy.system_types?.name_th ?? '-'}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-700">
                      {formatBudget(caseStudy.budget_min, caseStudy.budget_max)}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={caseStudy.status} />

                      {caseStudy.is_featured ? (
                        <div className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </div>
                      ) : null}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {caseStudy.status === 'published' ? (
                          <Link
                            href={`/cases/${caseStudy.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            ดูหน้าเว็บ
                          </Link>
                        ) : null}

                        <Link
                          href={`/admin/cases/${caseStudy.id}`}
                          className="inline-flex rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                          แก้ไข
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h3 className="text-xl font-bold text-slate-950">
              ยังไม่มีเคสในระบบ
            </h3>
            <p className="mt-2 text-slate-600">
              เริ่มจากการเพิ่มเคสงานติดตั้งจริงเคสแรก
            </p>
            <Link
              href="/admin/cases/new"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              เพิ่มเคสใหม่
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styleMap: Record<string, string> = {
    published: 'bg-emerald-50 text-emerald-700',
    draft: 'bg-slate-100 text-slate-700',
    archived: 'bg-red-50 text-red-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styleMap[status] ?? 'bg-slate-100 text-slate-700'
        }`}
    >
      {status}
    </span>
  )
}
