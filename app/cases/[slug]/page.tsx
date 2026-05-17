import { notFound } from 'next/navigation'

import { CaseDetailWorkspace } from '@/src/components/case-detail-workspace'
import { PortalShell } from '@/src/components/portal-shell'
import { getCaseDetail } from '@/src/lib/queries/case-detail'

type CaseDetailPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: CaseDetailPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  if (!caseDetail) {
    return {
      title: 'ไม่พบเคส',
    }
  }

  return {
    title: caseDetail.title,
    description: caseDetail.subtitle ?? caseDetail.customer_visible_notes ?? undefined,
  }
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { slug } = await params
  const caseDetail = await getCaseDetail(slug)

  if (!caseDetail) {
    notFound()
  }

  return (
    <PortalShell>
      <CaseDetailWorkspace caseDetail={caseDetail} />
    </PortalShell>
  )
}
