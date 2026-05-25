'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'

import { getCaseImageUrl } from '@/src/lib/case-utils'

export type CaseCarouselImage = {
  id?: string
  image_url: string | null
  storage_path?: string | null
  caption: string | null
  alt_text?: string | null
  kind?: string
  sort_order?: number | null
}

type CaseImageCarouselProps = {
  images: CaseCarouselImage[] | null | undefined
  title: string
  label?: string
  aspectClassName?: string
  imageClassName?: string
  sizes?: string
  priority?: boolean
  showThumbnails?: boolean
  emptyText?: string
  className?: string
}

type NormalizedImage = CaseCarouselImage & {
  url: string
  alt: string
}

function normalizeImages(
  images: CaseCarouselImage[] | null | undefined,
  title: string,
) {
  return (images ?? [])
    .map((image) => {
      const url = getCaseImageUrl(image)

      if (!url) return null

      return {
        ...image,
        url,
        alt: image.alt_text ?? image.caption ?? title,
      }
    })
    .filter((image): image is NormalizedImage => Boolean(image))
}

export function CaseImageCarousel({
  images,
  title,
  label,
  aspectClassName = 'aspect-[16/10]',
  imageClassName = 'object-cover',
  sizes = '100vw',
  priority = false,
  showThumbnails = true,
  emptyText = 'ยังไม่มีรูปภาพสำหรับเคสนี้',
  className = '',
}: CaseImageCarouselProps) {
  const visibleImages = useMemo(
    () => normalizeImages(images, title),
    [images, title],
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const hasMultipleImages = visibleImages.length > 1
  const safeActiveIndex =
    visibleImages.length === 0
      ? 0
      : Math.min(activeIndex, visibleImages.length - 1)
  const activeImage = visibleImages[safeActiveIndex]

  const goToPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      const lastIndex = visibleImages.length - 1
      const clampedIndex = Math.min(currentIndex, lastIndex)

      return clampedIndex === 0 ? lastIndex : clampedIndex - 1
    })
  }, [visibleImages.length])

  const goToNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      const lastIndex = visibleImages.length - 1
      const clampedIndex = Math.min(currentIndex, lastIndex)

      return clampedIndex === lastIndex ? 0 : clampedIndex + 1
    })
  }, [visibleImages.length])

  useEffect(() => {
    if (!lightboxOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLightboxOpen(false)
      }

      if (event.key === 'ArrowLeft') {
        goToPrevious()
      }

      if (event.key === 'ArrowRight') {
        goToNext()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goToNext, goToPrevious, lightboxOpen])

  if (visibleImages.length === 0 || !activeImage) {
    return (
      <div
        className={`flex ${aspectClassName} items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-500 ${className}`}
      >
        {emptyText}
      </div>
    )
  }

  return (
    <>
      <div
        className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      >
        <div className={`relative ${aspectClassName} bg-slate-100`}>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group/image relative block h-full w-full overflow-hidden"
            aria-label="เปิดดูรูปภาพขนาดใหญ่"
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt}
              fill
              sizes={sizes}
              priority={priority}
              loading={priority ? 'eager' : undefined}
              className={`${imageClassName} transition duration-500 group-hover/image:scale-[1.02]`}
            />
            <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-0 backdrop-blur transition group-hover/image:opacity-100">
              <Expand className="h-4 w-4" />
            </span>
          </button>

          {label ? (
            <span className="absolute left-4 top-4 rounded-xl bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
              {label}
            </span>
          ) : null}

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
                aria-label="รูปถัดไป"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                {safeActiveIndex + 1}/{visibleImages.length}
              </div>
            </>
          ) : null}
        </div>

        {activeImage.caption ? (
          <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            {activeImage.caption}
          </div>
        ) : null}

        {showThumbnails && hasMultipleImages ? (
          <div className="flex gap-3 overflow-x-auto border-t border-slate-100 p-3">
            {visibleImages.map((image, index) => (
              <button
                key={image.id ?? `${image.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border bg-slate-100 transition ${
                  index === safeActiveIndex
                    ? 'border-blue-700 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                aria-label={`ดูรูปที่ ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="ดูรูปภาพขนาดใหญ่"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
            aria-label="ปิดรูปภาพขนาดใหญ่"
          >
            <X className="h-5 w-5" />
          </button>

          {hasMultipleImages ? (
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              aria-label="รูปก่อนหน้า"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : null}

          <figure className="flex max-h-[90vh] w-full max-w-6xl flex-col items-center gap-4">
            <div className="relative h-[72vh] w-full">
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <figcaption className="max-w-3xl text-center text-sm text-white/80">
              {activeImage.caption ?? title}
              {hasMultipleImages ? (
                <span className="ml-3 font-bold text-white">
                  {safeActiveIndex + 1}/{visibleImages.length}
                </span>
              ) : null}
            </figcaption>
          </figure>

          {hasMultipleImages ? (
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              aria-label="รูปถัดไป"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
