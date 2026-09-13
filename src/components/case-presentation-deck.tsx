'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  Eye,
  EyeOff,
  MapPin,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react'

import { BrandLogo } from '@/src/components/brand-logo'
import { trackAnalytics } from '@/src/lib/analytics/client'

export type PresentationImage = {
  id: string
  url: string
  alt: string
  caption: string | null
}

export type CasePresentationData = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  category: string | null
  siteType: string | null
  doorType: string | null
  systemType: string | null
  location: string | null
  budget: string | null
  userCount: string | null
  installationDays: string | null
  installedAt: string | null
  problem: string | null
  requirement: string | null
  solution: string | null
  outcome: string | null
  primaryImage: PresentationImage | null
  beforeImages: PresentationImage[]
  afterImages: PresentationImage[]
  galleryImages: PresentationImage[]
  diagramImages: PresentationImage[]
}

type CasePresentationDeckProps = {
  data: CasePresentationData
}

type Slide = {
  id: string
  label: string
  content: ReactNode
}

function chunkImages(images: PresentationImage[], size: number) {
  const chunks: PresentationImage[][] = []

  for (let index = 0; index < images.length; index += size) {
    chunks.push(images.slice(index, index + size))
  }

  return chunks
}

function SlideHeader({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string
  title: string
  description?: string | null
  light?: boolean
}) {
  return (
    <div className="relative z-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-1 w-12 rounded-full bg-red-500" />
        <span
          className={`text-xs font-bold uppercase tracking-[0.22em] ${
            light ? 'text-slate-400' : 'text-blue-200'
          }`}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className={`max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${
          light ? 'text-slate-950' : 'text-white'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-4xl text-base leading-7 sm:text-lg ${
            light ? 'text-slate-600' : 'text-slate-300'
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

function SlideFooter({
  current,
  total,
  light = false,
}: {
  current: number
  total: number
  light?: boolean
}) {
  return (
    <div
      className={`absolute inset-x-8 bottom-5 z-20 hidden items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] sm:inset-x-12 sm:flex lg:inset-x-16 ${
        light ? 'text-slate-400' : 'text-slate-500'
      }`}
    >
      <span>Tigersoft Security Solutions</span>
      <span>
        {current.toString().padStart(2, '0')} / {total.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

function PresentationPhoto({
  image,
  sizes,
  preload = false,
  contain = false,
}: {
  image: PresentationImage
  sizes: string
  preload?: boolean
  contain?: boolean
}) {
  return (
    <div className="relative h-full min-h-52 w-full overflow-hidden rounded-3xl bg-slate-900">
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        preload={preload}
        className={contain ? 'object-contain' : 'object-cover'}
      />
      {image.caption ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-5 pb-4 pt-12 text-sm font-semibold text-white">
          {image.caption}
        </div>
      ) : null}
    </div>
  )
}

function StoryCard({
  index,
  title,
  text,
}: {
  index: string
  title: string
  text: string
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <span className="text-2xl font-black text-blue-100">{index}</span>
      </div>
      <p className="mt-4 line-clamp-5 text-sm leading-7 text-slate-600 sm:text-base">
        {text}
      </p>
    </article>
  )
}

function FactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 sm:p-5">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-400">
        <Icon className="h-5 w-5 text-red-400" />
        {label}
      </div>
      <div className="mt-3 text-base font-bold text-white sm:text-lg">{value}</div>
    </div>
  )
}

export function CasePresentationDeck({ data }: CasePresentationDeckProps) {
  const deckRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [showBudget, setShowBudget] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const storyCards = [
    data.problem ? { title: 'โจทย์ของลูกค้า', text: data.problem } : null,
    data.requirement
      ? { title: 'ความต้องการหลัก', text: data.requirement }
      : null,
    data.solution ? { title: 'แนวทางติดตั้ง', text: data.solution } : null,
    data.outcome ? { title: 'ผลลัพธ์ที่ได้รับ', text: data.outcome } : null,
  ].filter((item): item is { title: string; text: string } => Boolean(item))

  const galleryChunks = chunkImages(data.galleryImages, 4)
  const technicalFacts = [
    data.systemType
      ? { icon: ShieldCheck, label: 'ระบบที่ติดตั้ง', value: data.systemType }
      : null,
    data.doorType
      ? { icon: Wrench, label: 'รูปแบบการเข้าออก', value: data.doorType }
      : null,
    data.siteType
      ? { icon: Building2, label: 'ประเภทหน้างาน', value: data.siteType }
      : null,
    data.location
      ? { icon: MapPin, label: 'สถานที่', value: data.location }
      : null,
    data.userCount
      ? { icon: Users, label: 'จำนวนผู้ใช้งาน', value: data.userCount }
      : null,
    data.installationDays
      ? { icon: CalendarDays, label: 'ระยะเวลาติดตั้ง', value: data.installationDays }
      : null,
    data.installedAt
      ? { icon: CalendarDays, label: 'วันที่ติดตั้ง', value: data.installedAt }
      : null,
    showBudget && data.budget
      ? { icon: Building2, label: 'งบประมาณ', value: data.budget }
      : null,
  ].filter(
    (
      item,
    ): item is {
      icon: typeof Building2
      label: string
      value: string
    } => Boolean(item),
  )

  const slides: Slide[] = []

  slides.push({
    id: 'cover',
    label: 'หน้าปก',
    content: (
      <div className="grid h-full min-h-0 gap-8 p-8 pb-14 sm:p-12 sm:pb-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12 lg:p-16 lg:pb-16">
        <div className="relative z-10 flex min-w-0 flex-col justify-center">
          <div className="mb-7 flex flex-wrap gap-2">
            {data.category ? (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-950">
                {data.category}
              </span>
            ) : null}
            {data.siteType ? (
              <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-slate-200">
                {data.siteType}
              </span>
            ) : null}
          </div>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {data.title}
          </h1>
          {data.subtitle ? (
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-xl">
              {data.subtitle}
            </p>
          ) : null}
          <div className="mt-8 flex items-center gap-3 text-sm font-bold text-blue-200">
            <span className="h-1 w-12 rounded-full bg-red-500" />
            Installation Reference
          </div>
        </div>

        <div className="relative z-10 min-h-64 lg:min-h-0">
          {data.primaryImage ? (
            <PresentationPhoto
              image={data.primaryImage}
              sizes="(min-width: 1024px) 46vw, 100vw"
              preload
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-slate-400">
              ยังไม่มีรูปตัวอย่าง
            </div>
          )}
          <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-3xl border-b-4 border-l-4 border-red-500" />
        </div>
      </div>
    ),
  })

  if (storyCards.length > 0) {
    slides.push({
      id: 'story',
      label: 'โจทย์และแนวทาง',
      content: (
        <div className="flex h-full flex-col p-8 pb-14 sm:p-12 sm:pb-16 lg:p-16 lg:pb-16">
          <SlideHeader
            eyebrow="Customer Story"
            title="จากโจทย์หน้างาน สู่ระบบที่ตอบโจทย์"
            description={data.subtitle}
            light
          />
          <div className="mt-8 grid flex-1 content-center gap-4 sm:grid-cols-2 lg:gap-5">
            {storyCards.map((item, index) => (
              <StoryCard
                key={item.title}
                index={(index + 1).toString().padStart(2, '0')}
                title={item.title}
                text={item.text}
              />
            ))}
          </div>
        </div>
      ),
    })
  }

  if (data.beforeImages.length > 0 || data.afterImages.length > 0) {
    slides.push({
      id: 'comparison',
      label: 'ก่อนและหลังติดตั้ง',
      content: (
        <div className="flex h-full flex-col p-8 pb-14 sm:p-12 sm:pb-16 lg:p-16 lg:pb-16">
          <SlideHeader
            eyebrow="Before & After"
            title="เห็นความเปลี่ยนแปลงจากหน้างานจริง"
          />
          <div
            className={`mt-7 grid flex-1 min-h-0 gap-5 ${
              data.beforeImages.length > 0 && data.afterImages.length > 0
                ? 'lg:grid-cols-2'
                : ''
            }`}
          >
            {data.beforeImages[0] ? (
              <div className="flex min-h-64 flex-col">
                <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                  ก่อนติดตั้ง
                </div>
                <div className="min-h-0 flex-1">
                  <PresentationPhoto
                    image={data.beforeImages[0]}
                    sizes="(min-width: 1024px) 44vw, 100vw"
                  />
                </div>
              </div>
            ) : null}
            {data.afterImages[0] ? (
              <div className="flex min-h-64 flex-col">
                <div className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-red-300">
                  หลังติดตั้ง
                </div>
                <div className="min-h-0 flex-1">
                  <PresentationPhoto
                    image={data.afterImages[0]}
                    sizes="(min-width: 1024px) 44vw, 100vw"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ),
    })
  }

  galleryChunks.forEach((images, index) => {
    slides.push({
      id: `gallery-${index + 1}`,
      label: galleryChunks.length > 1 ? `ภาพหน้างาน ${index + 1}` : 'ภาพหน้างาน',
      content: (
        <div className="flex h-full flex-col p-8 pb-14 sm:p-12 sm:pb-16 lg:p-16 lg:pb-16">
          <SlideHeader
            eyebrow="Project Gallery"
            title="รายละเอียดการติดตั้งจากสถานที่จริง"
            description={
              galleryChunks.length > 1
                ? `ชุดภาพ ${index + 1} จาก ${galleryChunks.length}`
                : data.location
            }
            light
          />
          <div
            className={`mt-7 grid flex-1 min-h-0 gap-4 ${
              images.length === 1 ? '' : 'sm:grid-cols-2'
            }`}
          >
            {images.map((image) => (
              <PresentationPhoto
                key={image.id}
                image={image}
                sizes={images.length === 1 ? '90vw' : '(min-width: 640px) 45vw, 100vw'}
              />
            ))}
          </div>
        </div>
      ),
    })
  })

  if (technicalFacts.length > 0 || data.diagramImages.length > 0) {
    slides.push({
      id: 'technical',
      label: 'ข้อมูลโครงการ',
      content: (
        <div className="grid h-full min-h-0 gap-8 p-8 pb-14 sm:p-12 sm:pb-16 lg:grid-cols-[0.95fr_1.05fr] lg:p-16 lg:pb-16">
          <div className="flex min-w-0 flex-col">
            <SlideHeader
              eyebrow="Project Snapshot"
              title="ข้อมูลสำคัญสำหรับตัดสินใจ"
            />
            <div className="mt-8 grid content-center gap-3 sm:grid-cols-2">
              {technicalFacts.map((fact) => (
                <FactCard
                  key={fact.label}
                  icon={fact.icon}
                  label={fact.label}
                  value={fact.value}
                />
              ))}
            </div>
          </div>

          <div className="min-h-64 lg:min-h-0">
            {data.diagramImages[0] ? (
              <PresentationPhoto
                image={data.diagramImages[0]}
                sizes="(min-width: 1024px) 48vw, 100vw"
                contain
              />
            ) : data.primaryImage ? (
              <PresentationPhoto
                image={data.primaryImage}
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-center text-slate-400">
                <div>
                  <ShieldCheck className="mx-auto h-12 w-12 text-red-400" />
                  <p className="mt-4 font-semibold">Tigersoft Security Solutions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    })
  }

  const totalSlides = slides.length
  const safeActiveSlide = Math.min(activeSlide, totalSlides - 1)

  const goToPrevious = useCallback(() => {
    setActiveSlide((current) => Math.max(0, current - 1))
  }, [])

  const goToNext = useCallback(() => {
    setActiveSlide((current) => Math.min(totalSlides - 1, current + 1))
  }, [totalSlides])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null

      if (
        target?.matches('button, a, input, textarea, select') ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return
      }

      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault()
        goToNext()
      }

      if (['ArrowLeft', 'PageUp'].includes(event.key)) {
        event.preventDefault()
        goToPrevious()
      }

      if (event.key === 'Home') {
        event.preventDefault()
        setActiveSlide(0)
      }

      if (event.key === 'End') {
        event.preventDefault()
        setActiveSlide(totalSlides - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, totalSlides])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === deckRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const currentSlide = deckRef.current?.querySelector<HTMLElement>(
      '.presentation-slide[aria-hidden="false"]',
    )

    currentSlide?.scrollTo({ top: 0 })
  }, [safeActiveSlide])

  async function copyLink() {
    setCopyError(null)

    try {
      if (!navigator.clipboard) throw new Error('Clipboard is not available.')

      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopyError('ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกจากแถบที่อยู่')
    }
  }

  function downloadPdf() {
    trackAnalytics('presentation_export', {
      entityType: 'case',
      entityId: data.id,
      metadata: { format: 'pdf', budgetVisible: showBudget },
    })
    window.print()
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await deckRef.current?.requestFullscreen()
  }

  return (
    <div
      ref={deckRef}
      className="presentation-shell flex h-screen h-svh min-h-0 flex-col overflow-hidden bg-slate-950 text-white"
    >
      <header className="presentation-toolbar relative z-30 border-b border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href={`/cases/${data.slug}`}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="กลับหน้าเคส"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="hidden sm:block">
              <BrandLogo tone="light" />
            </div>
            <div className="min-w-0 sm:hidden">
              <div className="truncate text-sm font-bold">{data.title}</div>
              <div className="text-xs text-slate-400">Sales Presentation</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={copyLink}
              aria-label={copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <Clipboard className="h-4 w-4" />
              <span className="hidden md:inline">{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
            </button>
            {data.budget ? (
              <button
                type="button"
                onClick={() => setShowBudget((current) => !current)}
                aria-label={showBudget ? 'ซ่อนงบประมาณ' : 'แสดงงบประมาณ'}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {showBudget ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="hidden md:inline">
                  {showBudget ? 'ซ่อนงบประมาณ' : 'แสดงงบประมาณ'}
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'เปิดโหมดเต็มจอ'}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="hidden lg:inline">
                {isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ'}
              </span>
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              aria-label="ดาวน์โหลด PDF"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">ดาวน์โหลด PDF</span>
            </button>
          </div>
        </div>
        {copyError ? (
          <p className="mx-auto mt-2 max-w-[1600px] text-right text-sm font-semibold text-red-300" role="status">
            {copyError}
          </p>
        ) : null}
      </header>

      <main className="presentation-stage flex min-h-0 flex-1 items-stretch justify-center overflow-hidden p-3 sm:p-5 lg:items-center lg:p-7">
        {slides.map((slide, index) => {
          const isLight = slide.id === 'story' || slide.id.startsWith('gallery')
          const isActive = index === safeActiveSlide

          return (
            <section
              key={slide.id}
              aria-label={`${index + 1}. ${slide.label}`}
              aria-hidden={!isActive}
              className={`presentation-slide relative h-full max-h-full w-full max-w-[1600px] overflow-y-auto rounded-[1.75rem] shadow-2xl lg:h-auto lg:aspect-video lg:max-h-[calc(100vh-10.5rem)] lg:overflow-hidden ${
                isActive ? 'flex' : 'hidden'
              } ${
                isLight
                  ? 'bg-slate-50 text-slate-950'
                  : 'bg-slate-950 text-white ring-1 ring-white/10'
              }`}
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                <div
                  className={`absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl ${
                    isLight ? 'bg-blue-100/70' : 'bg-blue-600/10'
                  }`}
                />
                <div
                  className={`absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl ${
                    isLight ? 'bg-red-100/60' : 'bg-red-600/10'
                  }`}
                />
              </div>
              <div className="relative z-10 min-h-[calc(100svh-10rem)] w-full lg:min-h-0">
                {slide.content}
              </div>
              <SlideFooter
                current={index + 1}
                total={totalSlides}
                light={isLight}
              />
            </section>
          )
        })}
      </main>

      <nav
        className="presentation-navigation relative z-30 border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6"
        aria-label="ควบคุมสไลด์"
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={safeActiveSlide === 0}
            aria-label="สไลด์ก่อนหน้า"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">ก่อนหน้า</span>
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold text-slate-400">
              <span className="truncate">{slides[safeActiveSlide]?.label}</span>
              <span className="shrink-0">
                {safeActiveSlide + 1} / {totalSlides}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500 transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${((safeActiveSlide + 1) / totalSlides) * 100}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={safeActiveSlide === totalSlides - 1}
            aria-label="สไลด์ถัดไป"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span className="hidden sm:inline">ถัดไป</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <div className="sr-only" aria-live="polite">
        สไลด์ {safeActiveSlide + 1} จาก {totalSlides}:{' '}
        {slides[safeActiveSlide]?.label}
      </div>
    </div>
  )
}
