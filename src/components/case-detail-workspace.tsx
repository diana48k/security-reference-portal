'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  MapPin,
  Network,
  Share2,
  Tags,
  Users,
  Wrench,
} from 'lucide-react'

import { FavoriteCaseButton } from '@/src/components/favorite-case-button'
import { CaseImageCarousel } from '@/src/components/case-image-carousel'
import {
  formatBudget,
  formatThaiDate,
  getCaseDocumentUrl,
  getCaseImageUrl,
  getImagesByKind,
  sortBySortOrder,
} from '@/src/lib/case-utils'
import type {
  CaseDetail,
  CaseDetailDocument,
  CaseDetailImage,
  CaseLookup,
} from '@/src/lib/queries/case-detail'

type CaseDetailWorkspaceProps = {
  caseDetail: CaseDetail
}

type TabId =
  | 'detail'
  | 'equipment'
  | 'installation'
  | 'diagram'
  | 'faq'
  | 'sales'
  | 'files'

const tabs: Array<{ id: TabId; label: string; icon: typeof Layers }> = [
  { id: 'detail', label: 'รายละเอียดเคส', icon: CheckCircle2 },
  { id: 'equipment', label: 'อุปกรณ์ที่ใช้', icon: Wrench },
  { id: 'installation', label: 'วิธีการติดตั้ง', icon: Network },
  { id: 'diagram', label: 'แผนผัง / ไดอะแกรม', icon: Layers },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'sales', label: 'Sales Notes', icon: Clipboard },
  { id: 'files', label: 'ไฟล์ที่เกี่ยวข้อง', icon: FileText },
]

function hasDocumentUrl(document: CaseDetailDocument) {
  return Boolean(getCaseDocumentUrl(document))
}

function GalleryPanel({
  image,
  title,
  label,
}: {
  image?: CaseDetailImage
  title: string
  label: string
}) {
  const imageUrl = image ? getCaseImageUrl(image) : null
  const altText = image?.alt_text ?? image?.caption ?? title

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={altText}
            fill
            sizes="(min-width: 1280px) 36vw, 100vw"
            priority
            loading="eager"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            ยังไม่มีรูป {label}
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-xl bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          {label}
        </span>
      </div>
    </figure>
  )
}

function EmptyBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      <div className="font-bold text-slate-950">{title}</div>
      <p className="mt-2 leading-6">{text}</p>
    </div>
  )
}

function InfoList({
  title,
  items,
}: {
  title: string
  items: Array<string | null | undefined>
}) {
  const visibleItems = Array.from(
    new Set(items.filter((item): item is string => Boolean(item))),
  )

  if (visibleItems.length === 0) {
    return <EmptyBlock title={title} text="ยังไม่มีข้อมูลในหัวข้อนี้" />
  }

  return (
    <div>
      <h3 className="font-bold text-slate-950">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {visibleItems.map((item, index) => (
          <li key={`${index}-${item}`} className="flex gap-2">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DocumentsList({ documents }: { documents: CaseDetailDocument[] }) {
  const visibleDocuments = sortBySortOrder(documents).filter(hasDocumentUrl)

  if (visibleDocuments.length === 0) {
    return (
      <EmptyBlock
        title="ยังไม่มีไฟล์แนบ"
        text="ทีมเทคนิคสามารถอัปโหลด PDF, drawing, spec หรือเอกสารประกอบจากหน้า Admin ได้"
      />
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {visibleDocuments.map((document) => {
        const url = getCaseDocumentUrl(document)

        if (!url) return null

        return (
          <a
            key={document.id}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-950 group-hover:text-blue-700">
                  {document.file_name ?? document.kind.toUpperCase()}
                </div>
                {document.description ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                    {document.description}
                  </p>
                ) : null}
                <div className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {document.kind}
                </div>
              </div>
            </div>
          </a>
        )
      })}
    </div>
  )
}

function dedupeLookups(items: Array<CaseLookup | null | undefined>) {
  const seen = new Set<string>()

  return items.filter((item): item is CaseLookup => {
    if (!item) return false

    const key = `${item.slug}-${item.name_th}`
    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

export function CaseDetailWorkspace({ caseDetail }: CaseDetailWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>('detail')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  const beforeImages = useMemo(
    () => getImagesByKind(caseDetail.case_images, 'before'),
    [caseDetail.case_images],
  )
  const afterImages = useMemo(
    () => getImagesByKind(caseDetail.case_images, 'after'),
    [caseDetail.case_images],
  )
  const diagramImages = useMemo(
    () => getImagesByKind(caseDetail.case_images, 'diagram'),
    [caseDetail.case_images],
  )
  const galleryImages = useMemo(
    () =>
      sortBySortOrder(caseDetail.case_images).filter((image) =>
        getCaseImageUrl(image),
      ),
    [caseDetail.case_images],
  )

  const lookups = dedupeLookups([
    caseDetail.categories,
    caseDetail.door_types,
    caseDetail.system_types,
    caseDetail.site_types,
    ...caseDetail.tags,
  ])

  const suitableLookups = dedupeLookups([
    caseDetail.site_types,
    caseDetail.categories,
    caseDetail.door_types,
    caseDetail.system_types,
  ])

  async function copyLink() {
    setCopyError(null)

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard is not available.')
      }

      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopyError(
        'Could not copy the link. Please copy the URL from the address bar.',
      )
    }
  }

  function shareToCustomer() {
    window.open(
      `/cases/${caseDetail.slug}/present`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="font-semibold hover:text-slate-950">
            หน้าหลัก
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/cases" className="font-semibold hover:text-slate-950">
            เคสโครงการ
          </Link>
          {caseDetail.categories ? (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link
                href={`/categories/${caseDetail.categories.slug}`}
                className="font-semibold hover:text-slate-950"
              >
                {caseDetail.categories.name_th}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-slate-950">
            {caseDetail.title}
          </span>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                {caseDetail.title}
              </h1>
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                ติดตั้งเสร็จสมบูรณ์
              </span>
            </div>
            {caseDetail.subtitle ? (
              <p className="mt-3 max-w-4xl leading-7 text-slate-600">
                {caseDetail.subtitle}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {lookups.map((item) => (
                <span
                  key={`${item.slug}-${item.name_th}`}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {item.name_th}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-5 text-sm text-slate-600">
              {caseDetail.location ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  สถานที่: {caseDetail.location}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                ผู้ใช้งาน:{' '}
                {caseDetail.user_count
                  ? `${caseDetail.user_count.toLocaleString('th-TH')} คน`
                  : 'ไม่ระบุ'}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                ระยะเวลาดำเนินการ:{' '}
                {caseDetail.installation_days
                  ? `${caseDetail.installation_days} วัน`
                  : 'ไม่ระบุ'}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                ติดตั้งเมื่อ: {formatThaiDate(caseDetail.installed_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <FavoriteCaseButton
              caseId={caseDetail.id}
              slug={caseDetail.slug}
              isFavorited={caseDetail.is_favorited}
              canFavorite={caseDetail.can_favorite}
            />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" />
              {copied ? 'คัดลอกแล้ว' : 'แชร์ให้ลูกค้า'}
            </button>
            <button
              type="button"
              onClick={shareToCustomer}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Download className="h-4 w-4" />
              ดาวน์โหลดสรุป (PDF)
            </button>
            {copyError ? (
              <p
                className="basis-full text-sm font-semibold text-red-600"
                role="status"
              >
                {copyError}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <GalleryPanel
              image={beforeImages[0]}
              title={caseDetail.title}
              label="ก่อนติดตั้ง"
            />
            <GalleryPanel
              image={afterImages[0]}
              title={caseDetail.title}
              label="หลังติดตั้ง"
            />
          </div>

          <CaseImageCarousel
            images={galleryImages}
            title={caseDetail.title}
            label="รูปภาพทั้งหมด"
            sizes="(min-width: 1280px) 62vw, 100vw"
            priority
            emptyText="ยังไม่มีรูปภาพสำหรับเคสนี้"
          />

          {galleryImages.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryImages.slice(0, 5).map((image) => {
                const imageUrl = getCaseImageUrl(image)

                if (!imageUrl) return null

                return (
                  <div
                    key={image.id}
                    className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  >
                    <Image
                      src={imageUrl}
                      alt={image.alt_text ?? image.caption ?? caseDetail.title}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </div>
                )
              })}
              {galleryImages.length > 5 ? (
                <div className="flex h-20 w-32 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700">
                  +{galleryImages.length - 5}
                  <span className="text-xs font-medium text-slate-500">
                    รูปทั้งหมด
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex h-14 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-bold transition ${
                      active
                        ? 'border-blue-700 text-blue-700'
                        : 'border-transparent text-slate-500 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="p-5 lg:p-6">
              {activeTab === 'detail' ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  <InfoList
                    title="โจทย์ของลูกค้า"
                    items={[
                      caseDetail.problem_statement,
                      caseDetail.requirement_summary,
                    ]}
                  />
                  <InfoList
                    title="แนวทางการแก้ไข"
                    items={[
                      caseDetail.solution_statement,
                      caseDetail.customer_visible_notes,
                    ]}
                  />
                </div>
              ) : null}

              {activeTab === 'equipment' ? (
                <InfoList
                  title="อุปกรณ์และระบบที่เกี่ยวข้อง"
                  items={[
                    caseDetail.system_types?.name_th,
                    caseDetail.door_types?.name_th,
                    caseDetail.categories?.name_th,
                    ...caseDetail.tags.map((tag) => tag.name_th),
                  ]}
                />
              ) : null}

              {activeTab === 'installation' ? (
                <InfoList
                  title="วิธีการติดตั้ง"
                  items={[
                    caseDetail.installation_notes,
                    caseDetail.solution_statement,
                    caseDetail.installation_days
                      ? `ใช้เวลาติดตั้งประมาณ ${caseDetail.installation_days} วัน`
                      : null,
                  ]}
                />
              ) : null}

              {activeTab === 'diagram' ? (
                diagramImages.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {diagramImages.map((image) => (
                      <GalleryPanel
                        key={image.id}
                        image={image}
                        title={caseDetail.title}
                        label="แผนผัง / ไดอะแกรม"
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBlock
                    title="ยังไม่มีแผนผัง / ไดอะแกรม"
                    text="สามารถเพิ่มรูปแผนผังจากหน้า Admin โดยเลือกชนิดรูปเป็นแผนผัง / ไดอะแกรม"
                  />
                )
              ) : null}

              {activeTab === 'faq' ? (
                caseDetail.faqs.length > 0 ? (
                  <div className="space-y-3">
                    {caseDetail.faqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="font-bold text-slate-950">
                          {faq.question}
                        </div>
                        <p className="mt-2 leading-7 text-slate-600">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyBlock
                    title="ยังไม่มี FAQ"
                    text="เพิ่มคำถามจากหน้า Admin FAQ ได้"
                  />
                )
              ) : null}

              {activeTab === 'sales' ? (
                caseDetail.sales_notes ? (
                  <div className="rounded-2xl bg-blue-50 p-5 leading-8 text-slate-700">
                    {caseDetail.sales_notes}
                  </div>
                ) : (
                  <EmptyBlock
                    title="ยังไม่มี Sales Notes"
                    text="เพิ่มจุดขายหรือข้อควรพูดคุยกับลูกค้าในหน้าแก้ไขเคส"
                  />
                )
              ) : null}

              {activeTab === 'files' ? (
                <DocumentsList documents={caseDetail.case_documents} />
              ) : null}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            <div className="font-semibold text-slate-700">
              เคสนี้มีประโยชน์กับคุณหรือไม่?
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="font-bold text-emerald-700">
                มีประโยชน์
              </button>
              <button type="button" className="font-bold text-red-600">
                ไม่มีประโยชน์
              </button>
            </div>
            <div className="flex flex-wrap gap-5">
              <span className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" />
                เปิดดู: ยังไม่บันทึกสถิติ
              </span>
              <span>โดย: ทีมเทคนิค</span>
            </div>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">สรุปข้อมูลเคส</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ['ระบบที่ติดตั้ง', caseDetail.system_types?.name_th],
                ['รูปแบบการเข้าออก', caseDetail.door_types?.name_th],
                ['ประเภทหน้างาน', caseDetail.site_types?.name_th],
                [
                  'จำนวนผู้ใช้งาน',
                  caseDetail.user_count
                    ? `${caseDetail.user_count.toLocaleString('th-TH')} คน`
                    : null,
                ],
                [
                  'งบประมาณ',
                  formatBudget(caseDetail.budget_min, caseDetail.budget_max),
                ],
                [
                  'ระยะเวลาติดตั้ง',
                  caseDetail.installation_days
                    ? `${caseDetail.installation_days} วัน`
                    : null,
                ],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[130px_1fr] gap-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-semibold text-slate-800">
                    {value ?? 'ไม่ระบุ'}
                  </dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              <FileText className="h-4 w-4" />
              ดูเอกสารทั้งหมด
            </button>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">เหมาะกับหน้างานประเภท</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {suitableLookups.map((item) => (
                <div
                  key={`${item.slug}-${item.name_th}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs font-semibold text-slate-700"
                >
                  <Tags className="mx-auto mb-2 h-5 w-5 text-blue-700" />
                  {item.name_th}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-slate-950">คำถามที่พบบ่อย (FAQ)</h2>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className="text-sm font-bold text-blue-700"
              >
                ดูทั้งหมด
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {caseDetail.faqs.slice(0, 4).map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => setActiveTab('faq')}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="line-clamp-1">{faq.question}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
              {caseDetail.faqs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  ยังไม่มี FAQ สำหรับเคสนี้
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}
