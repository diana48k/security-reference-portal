import Image from 'next/image'

import {
  getCaseImageUrl,
  getImagesByKind,
  sortBySortOrder,
} from '@/src/lib/case-utils'
import type { CaseDetailImage } from '@/src/lib/queries/case-detail'

type CaseGalleryProps = {
  images: CaseDetailImage[]
  title: string
}

function GalleryImage({ image, title }: { image: CaseDetailImage; title: string }) {
  const imageUrl = getCaseImageUrl(image)

  if (!imageUrl) {
    return null
  }

  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-slate-100">
        <Image
          src={imageUrl}
          alt={image.alt_text ?? image.caption ?? title}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
      {image.caption ? (
        <figcaption className="px-4 py-3 text-sm text-slate-600">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function CaseGallery({ images, title }: CaseGalleryProps) {
  const visibleImages = images.filter((image) => getCaseImageUrl(image))
  const beforeImages = getImagesByKind(visibleImages, 'before')
  const afterImages = getImagesByKind(visibleImages, 'after')
  const otherImages = sortBySortOrder(
    visibleImages.filter((image) => !['before', 'after'].includes(image.kind)),
  )

  if (visibleImages.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        ยังไม่มีรูปภาพสำหรับเคสนี้
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {(beforeImages.length > 0 || afterImages.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {beforeImages.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                ก่อนติดตั้ง
              </h3>
              <div className="grid gap-4">
                {beforeImages.map((image) => (
                  <GalleryImage key={image.id} image={image} title={title} />
                ))}
              </div>
            </section>
          ) : null}

          {afterImages.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                หลังติดตั้ง
              </h3>
              <div className="grid gap-4">
                {afterImages.map((image) => (
                  <GalleryImage key={image.id} image={image} title={title} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}

      {otherImages.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            แกลเลอรี
          </h3>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {otherImages.map((image) => (
              <GalleryImage key={image.id} image={image} title={title} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
