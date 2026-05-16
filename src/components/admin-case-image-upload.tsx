import Image from 'next/image'
import { ImageIcon, Trash2 } from 'lucide-react'

import { ConfirmActionButton } from '@/src/components/confirm-action-button'
import { SubmitButton } from '@/src/components/submit-button'
import {
  deleteCaseImageAction,
  uploadCaseImageAction,
} from '@/src/lib/actions/cases'
import { getCaseImageUrl } from '@/src/lib/case-utils'
import type { AdminCaseImage } from '@/src/lib/queries/admin-cases'

type AdminCaseImageUploadProps = {
  caseId: string
  images: AdminCaseImage[]
}

const imageKinds = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'diagram', label: 'Diagram' },
]

export function AdminCaseImageUpload({
  caseId,
  images,
}: AdminCaseImageUploadProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-950">Images</h2>
          <p className="text-sm text-slate-600">
            Upload Before, After, Gallery, or Diagram images.
          </p>
        </div>
      </div>

      <form
        action={uploadCaseImageAction}
        className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 lg:grid-cols-2"
      >
        <input type="hidden" name="case_id" value={caseId} />

        <Field label="Image file">
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
        </Field>

        <Field label="Kind">
          <select
            name="kind"
            defaultValue="gallery"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950"
          >
            {imageKinds.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Caption">
          <input
            name="caption"
            placeholder="Optional caption"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950"
          />
        </Field>

        <Field label="Alt text">
          <input
            name="alt_text"
            placeholder="Optional image description"
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

        <div className="flex items-end">
          <SubmitButton
            pendingText="Uploading..."
            className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Upload image
          </SubmitButton>
        </div>
      </form>

      {images.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => {
            const imageUrl = getCaseImageUrl(image)

            return (
              <article
                key={image.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                {imageUrl ? (
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <Image
                      src={imageUrl}
                      alt={image.alt_text ?? image.caption ?? image.kind}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-sm text-slate-500">
                    Missing image URL
                  </div>
                )}

                <div className="space-y-3 p-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {image.kind}
                    </div>
                    <h3 className="mt-1 font-semibold text-slate-950">
                      {image.caption ?? image.storage_path ?? 'Untitled image'}
                    </h3>
                  </div>

                  <form action={deleteCaseImageAction}>
                    <input type="hidden" name="image_id" value={image.id} />
                    <ConfirmActionButton
                      confirmMessage={`Delete image "${image.caption ?? image.storage_path ?? image.id}"?`}
                      pendingText="Deleting..."
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete image
                    </ConfirmActionButton>
                  </form>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No images uploaded yet.
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
