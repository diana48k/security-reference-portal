import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

import { CaseImageCarousel } from '@/src/components/case-image-carousel'
import { formatBudget, sortBySortOrder } from '@/src/lib/case-utils'
import type { HomeCase } from '@/src/lib/queries/home'

type CaseCardProps = {
  caseStudy: HomeCase
}

export function CaseCard({ caseStudy }: CaseCardProps) {
  const images = sortBySortOrder(caseStudy.case_images)

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <CaseImageCarousel
          images={images}
          title={caseStudy.title}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          showThumbnails={false}
          emptyText="ยังไม่มีรูปตัวอย่าง"
          className="rounded-none border-0 shadow-none"
        />
        <div className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {caseStudy.categories?.name_th ?? 'Case Study'}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <Link href={`/cases/${caseStudy.slug}`} className="block">
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-950 transition hover:text-blue-700">
              {caseStudy.title}
            </h3>
          </Link>
          {caseStudy.subtitle ? (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {caseStudy.subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {caseStudy.site_types?.name_th ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {caseStudy.site_types.name_th}
            </span>
          ) : null}
          {caseStudy.door_types?.name_th ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {caseStudy.door_types.name_th}
            </span>
          ) : null}
          {caseStudy.system_types?.name_th ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              {caseStudy.system_types.name_th}
            </span>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {caseStudy.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{caseStudy.location}</span>
            </div>
          ) : null}

          <div>{formatBudget(caseStudy.budget_min, caseStudy.budget_max)}</div>

          {caseStudy.installation_days ? (
            <div>ระยะเวลาติดตั้งประมาณ {caseStudy.installation_days} วัน</div>
          ) : null}
        </div>

        <Link
          href={`/cases/${caseStudy.slug}`}
          className="flex items-center justify-between pt-2 text-sm font-medium text-slate-950 transition hover:text-blue-700"
        >
          <span>ดูรายละเอียดเคส</span>
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  )
}
