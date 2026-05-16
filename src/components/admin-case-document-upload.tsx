import { ExternalLink, FileText, Trash2 } from 'lucide-react'

import {
  deleteCaseDocumentAction,
  uploadCaseDocumentAction,
} from '@/src/lib/actions/cases'
import { getCaseDocumentUrl } from '@/src/lib/case-utils'
import type { AdminCaseDocument } from '@/src/lib/queries/admin-cases'

type AdminCaseDocumentUploadProps = {
  caseId: string
  documents: AdminCaseDocument[]
}

const documentKinds = [
  { value: 'pdf', label: 'PDF' },
  { value: 'drawing', label: 'Drawing' },
  { value: 'spec', label: 'Spec' },
  { value: 'brochure', label: 'Brochure' },
  { value: 'quotation_example', label: 'Quotation example' },
  { value: 'other', label: 'Other' },
]

export function AdminCaseDocumentUpload({
  caseId,
  documents,
}: AdminCaseDocumentUploadProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-950">Documents</h2>
          <p className="text-sm text-slate-600">
            Upload PDFs, drawings, specs, and brochures.
          </p>
        </div>
      </div>

      <form
        action={uploadCaseDocumentAction}
        className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 lg:grid-cols-2"
      >
        <input type="hidden" name="case_id" value={caseId} />

        <Field label="Document file">
          <input
            type="file"
            name="file"
            accept=".pdf,.dwg,.dxf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*,application/pdf"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </Field>

        <Field label="Kind">
          <select
            name="kind"
            defaultValue="pdf"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950"
          >
            {documentKinds.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Display name">
          <input
            name="file_name"
            placeholder="Optional, defaults to file name"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950"
          />
        </Field>

        <Field label="Sort order">
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950"
          />
        </Field>

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Description
          </span>
          <textarea
            name="description"
            rows={3}
            placeholder="Optional notes about this document"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Upload document
          </button>
        </div>
      </form>

      {documents.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {documents.map((document) => {
            const documentUrl = getCaseDocumentUrl(document)

            return (
              <article
                key={document.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {document.kind}
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-950">
                    {document.file_name ?? document.storage_path ?? 'Untitled'}
                  </h3>
                  {document.description ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {document.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {documentUrl ? (
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  ) : null}

                  <form action={deleteCaseDocumentAction}>
                    <input
                      type="hidden"
                      name="document_id"
                      value={document.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No documents uploaded yet.
        </div>
      )}
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  )
}
