import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'

import { applyAnalyticsCookies, recordAnalyticsEvent } from '@/src/lib/analytics/server'
import { getCaseDocumentUrl } from '@/src/lib/case-utils'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin.from('case_documents').select('id, case_id, file_url, storage_path, file_name, case_studies!inner(status)').eq('id', id).eq('case_studies.status', 'published').maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  const url = getCaseDocumentUrl(data)
  if (!url) return NextResponse.json({ error: 'Document file is unavailable' }, { status: 404 })
  const target = new URL(url)
  if (!['http:', 'https:'].includes(target.protocol)) return NextResponse.json({ error: 'Invalid document URL' }, { status: 400 })
  const result = await recordAnalyticsEvent(request, { id: request.nextUrl.searchParams.get('event') ?? randomUUID(), eventName: 'document_download', path: request.headers.get('referer') ? new URL(request.headers.get('referer')!).pathname : '/documents', entityType: 'document', entityId: id, metadata: { fileName: data.file_name ?? '' } })
  return applyAnalyticsCookies(NextResponse.redirect(target), result.cookies)
}
