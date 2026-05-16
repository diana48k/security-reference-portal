import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { AdminCaseDocumentUpload } from '@/src/components/admin-case-document-upload'
import { AdminCaseForm } from '@/src/components/admin-case-form'
import { AdminCaseImageUpload } from '@/src/components/admin-case-image-upload'
import { AdminCaseStatusActions } from '@/src/components/admin-case-status-actions'
import {
  getAdminCaseById,
  getAdminCaseMedia,
  getCaseFormOptions,
} from '@/src/lib/queries/admin-cases'

type AdminEditCasePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminEditCasePage({
  params,
}: AdminEditCasePageProps) {
  const { id } = await params
  const [caseStudy, options, media] = await Promise.all([
    getAdminCaseById(id),
    getCaseFormOptions(),
    getAdminCaseMedia(id),
  ])

  if (!caseStudy) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        <Link
          href="/admin/cases"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cases
        </Link>

        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Edit case study
        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {caseStudy.title}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              /cases/{caseStudy.slug}
            </p>
          </div>

          {caseStudy.status === 'published' ? (
            <Link
              href={`/cases/${caseStudy.slug}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <ExternalLink className="h-4 w-4" />
              View public page
            </Link>
          ) : null}
        </div>
      </section>

      <AdminCaseStatusActions
        id={caseStudy.id}
        status={caseStudy.status}
        title={caseStudy.title}
      />

      <AdminCaseImageUpload caseId={caseStudy.id} images={media.images} />

      <AdminCaseDocumentUpload
        caseId={caseStudy.id}
        documents={media.documents}
      />

      <AdminCaseForm
        mode="edit"
        caseStudy={caseStudy}
        categories={options.categories}
        siteTypes={options.siteTypes}
        doorTypes={options.doorTypes}
        systemTypes={options.systemTypes}
      />
    </div>
  )
}
