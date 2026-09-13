import { notFound } from 'next/navigation'

import {
  CasePresentationDeck,
  type CasePresentationData,
  type PresentationImage,
} from '@/src/components/case-presentation-deck'
import {
  formatBudget,
  formatThaiDate,
  getCaseImageUrl,
  getImagesByKind,
  getPrimaryCaseImage,
  sortBySortOrder,
} from '@/src/lib/case-utils'
import {
  getCaseDetail,
  type CaseDetailImage,
} from '@/src/lib/queries/case-detail'

type PresentationPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PresentationPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  return {
    title: caseDetail ? `Sales Deck: ${caseDetail.title}` : 'ไม่พบเคส',
  }
}

function toPresentationImage(
  image: CaseDetailImage,
  title: string,
): PresentationImage | null {
  const url = getCaseImageUrl(image)

  if (!url) return null

  return {
    id: image.id,
    url,
    alt: image.alt_text ?? image.caption ?? title,
    caption: image.caption,
  }
}

function mapImages(images: CaseDetailImage[], title: string) {
  return images
    .map((image) => toPresentationImage(image, title))
    .filter((image): image is PresentationImage => Boolean(image))
}

export default async function CasePresentationPage({
  params,
}: PresentationPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  if (!caseDetail) {
    notFound()
  }

  const primaryImage = getPrimaryCaseImage(caseDetail.case_images)
  const hasBudget = Boolean(caseDetail.budget_min || caseDetail.budget_max)
  const data: CasePresentationData = {
    id: caseDetail.id,
    slug: caseDetail.slug,
    title: caseDetail.title,
    subtitle: caseDetail.subtitle,
    category: caseDetail.categories?.name_th ?? null,
    siteType: caseDetail.site_types?.name_th ?? null,
    doorType: caseDetail.door_types?.name_th ?? null,
    systemType: caseDetail.system_types?.name_th ?? null,
    location: caseDetail.location,
    budget: hasBudget
      ? formatBudget(caseDetail.budget_min, caseDetail.budget_max)
      : null,
    userCount: caseDetail.user_count
      ? `${caseDetail.user_count.toLocaleString('th-TH')} คน`
      : null,
    installationDays: caseDetail.installation_days
      ? `${caseDetail.installation_days} วัน`
      : null,
    installedAt: caseDetail.installed_at
      ? formatThaiDate(caseDetail.installed_at)
      : null,
    problem: caseDetail.problem_statement,
    requirement: caseDetail.requirement_summary,
    solution: caseDetail.solution_statement,
    outcome: caseDetail.customer_visible_notes,
    primaryImage: primaryImage
      ? toPresentationImage(primaryImage, caseDetail.title)
      : null,
    beforeImages: mapImages(
      getImagesByKind(caseDetail.case_images, 'before'),
      caseDetail.title,
    ),
    afterImages: mapImages(
      getImagesByKind(caseDetail.case_images, 'after'),
      caseDetail.title,
    ),
    galleryImages: mapImages(
      sortBySortOrder(
        caseDetail.case_images.filter((image) => image.kind === 'gallery'),
      ),
      caseDetail.title,
    ),
    diagramImages: mapImages(
      getImagesByKind(caseDetail.case_images, 'diagram'),
      caseDetail.title,
    ),
  }

  return <CasePresentationDeck data={data} />
}
