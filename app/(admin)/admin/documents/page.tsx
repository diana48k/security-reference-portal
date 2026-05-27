import Link from 'next/link'
import { Download, Edit, FileText, Files } from 'lucide-react'

import { formatThaiDate, getCaseDocumentUrl } from '@/src/lib/case-utils'
import {
  getAdminDocuments,
  type PortalDocument,
} from '@/src/lib/queries/documents'

export const metadata = {
  title: 'จัดการเอกสาร',
}

export default async function AdminDocumentsPage() {
  const documents = await getAdminDocuments()

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
            <Files className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              ผู้ดูแลระบบ
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              จัดการเอกสาร
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              ตรวจรายการเอกสารที่ผูกกับเคสทั้งหมด หากต้องการเพิ่มหรือลบไฟล์ ให้เข้าไปที่หน้าแก้ไขเคส
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              เอกสารทั้งหมด
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {documents.length.toLocaleString('th-TH')} รายการ
            </p>
          </div>
          <Link
            href="/admin/cases"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            จัดการเคส
          </Link>
        </div>

        {documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">เอกสาร</th>
                  <th className="px-6 py-4 font-semibold">ชนิด</th>
                  <th className="px-6 py-4 font-semibold">เคส</th>
                  <th className="px-6 py-4 font-semibold">สถานะเคส</th>
                  <th className="px-6 py-4 font-semibold">เพิ่มเมื่อ</th>
                  <th className="px-6 py-4 font-semibold">การทำงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((document) => (
                  <AdminDocumentRow key={document.id} document={document} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            ยังไม่มีเอกสารในระบบ
          </div>
        )}
      </section>
    </div>
  )
}

function AdminDocumentRow({ document }: { document: PortalDocument }) {
  const url = getCaseDocumentUrl(document)
  const caseStudy = document.case_studies

  return (
    <tr className="align-top">
      <td className="px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-950">
              {document.file_name ?? 'เอกสารประกอบเคส'}
            </div>
            {document.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                {document.description}
              </p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
        {document.kind}
      </td>
      <td className="px-6 py-5 text-sm text-slate-700">
        {caseStudy ? (
          <Link
            href={`/cases/${caseStudy.slug}`}
            target="_blank"
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            {caseStudy.title}
          </Link>
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-5">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {caseStudy?.status ?? 'ไม่ทราบสถานะ'}
        </span>
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">
        {formatThaiDate(document.created_at)}
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              ดาวน์โหลด
            </a>
          ) : null}
          {caseStudy ? (
            <Link
              href={`/admin/cases/${document.case_id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
            >
              <Edit className="h-4 w-4" />
              แก้ไขเคส
            </Link>
          ) : null}
        </div>
      </td>
    </tr>
  )
}
