import { CaseImageCarousel } from '@/src/components/case-image-carousel'
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
              <CaseImageCarousel
                images={beforeImages}
                title={title}
                label="ก่อนติดตั้ง"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </section>
          ) : null}

          {afterImages.length > 0 ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                หลังติดตั้ง
              </h3>
              <CaseImageCarousel
                images={afterImages}
                title={title}
                label="หลังติดตั้ง"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </section>
          ) : null}
        </div>
      )}

      {otherImages.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            แกลเลอรี
          </h3>
          <CaseImageCarousel
            images={otherImages}
            title={title}
            label="แกลเลอรี"
            sizes="(min-width: 1280px) 70vw, 100vw"
          />
        </section>
      ) : null}
    </div>
  )
}
