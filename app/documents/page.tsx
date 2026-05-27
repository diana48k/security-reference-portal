import Link from 'next/link'
import { Download, ExternalLink, FileText, Files, Search } from 'lucide-react'

import { PortalShell } from '@/src/components/portal-shell'
import { formatThaiDate, getCaseDocumentUrl } from '@/src/lib/case-utils'
import {
  getPublishedDocuments,
  type PortalDocument,
} from '@/src/lib/queries/documents'

export const metadata = {
  title: 'เอกสาร',
}

export default async function DocumentsPage() {
  const documents = await getPublishedDocuments()

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-blue-700">
              <Files className="h-4 w-4" />
              Documents
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
              เอกสาร / ดาวน์โหลด
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              รวม PDF, drawing, spec, brochure และเอกสารประกอบจากเคสที่เผยแพร่แล้ว
            </p>
          </div>
          <Link
            href="/search?hasImages=true"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            <Search className="h-4 w-4" />
            ค้นหาเคสประกอบ
          </Link>
        </section>

        {documents.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Files className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              ยังไม่มีเอกสารที่เผยแพร่
            </h2>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-600">
              เมื่อทีมเทคนิคอัปโหลดเอกสารให้เคสที่เผยแพร่แล้ว เอกสารจะแสดงในหน้านี้
            </p>
          </section>
        )}
      </div>
    </PortalShell>
  )
}

function DocumentCard({ document }: { document: PortalDocument }) {
  const url = getCaseDocumentUrl(document)
  const caseStudy = document.case_studies

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <FileText className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              {document.kind}
            </span>
            {caseStudy?.categories ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {caseStudy.categories.name_th}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 line-clamp-2 font-bold text-slate-950">
            {document.file_name ?? document.description ?? 'เอกสารประกอบเคส'}
          </h2>
          {document.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {document.description}
            </p>
          ) : null}
        </div>
      </div>

      {caseStudy ? (
        <Link
          href={`/cases/${caseStudy.slug}`}
          className="mt-4 block rounded-2xl bg-slate-50 p-4 text-sm transition hover:bg-blue-50"
        >
          <span className="font-semibold text-slate-500">เคสอ้างอิง</span>
          <span className="mt-1 line-clamp-2 block font-bold text-slate-950">
            {caseStudy.title}
          </span>
        </Link>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <span>เพิ่มเมื่อ {formatThaiDate(document.created_at)}</span>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            ดาวน์โหลด
          </a>
        ) : (
          <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-500">
            <ExternalLink className="h-4 w-4" />
            ไม่มีไฟล์
          </span>
        )}
      </div>
    </article>
  )
}
