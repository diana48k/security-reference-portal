import 'server-only'

import { createHmac, randomUUID } from 'node:crypto'
import type { NextRequest, NextResponse } from 'next/server'

import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import type { AnalyticsEventName } from '@/src/types/application'

const VISITOR_COOKIE = 'portal_vid'
const SESSION_COOKIE = 'portal_sid'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

export type AnalyticsInput = { id: string; eventName: AnalyticsEventName; path: string; entityType?: string; entityId?: string; metadata?: Record<string, string | number | boolean | null> }
type CookieValue = { name: string; value: string; maxAge: number }

export async function recordAnalyticsEvent(request: NextRequest, input: AnalyticsInput) {
  const secret = process.env.ANALYTICS_HASH_SECRET
  if (!secret) return { configured: false, inserted: false, cookies: [] as CookieValue[] }
  const admin = createSupabaseAdminClient()
  const now = new Date()
  const rawVisitor = request.cookies.get(VISITOR_COOKIE)?.value ?? randomUUID()
  const visitorHash = createHmac('sha256', secret).update(rawVisitor).digest('hex')
  let sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? randomUUID()
  const cookies: CookieValue[] = []
  if (!request.cookies.has(VISITOR_COOKIE)) cookies.push({ name: VISITOR_COOKIE, value: rawVisitor, maxAge: 60 * 60 * 24 * 395 })

  const { data: existingSession } = await admin.from('analytics_sessions').select('id, last_seen_at, page_view_count, download_count').eq('id', sessionId).maybeSingle()
  const isFresh = existingSession && now.getTime() - new Date(existingSession.last_seen_at).getTime() <= SESSION_TIMEOUT_MS
  if (!isFresh) sessionId = randomUUID()
  cookies.push({ name: SESSION_COOKIE, value: sessionId, maxAge: 60 * 30 })

  const supabase = await createSupabaseServerClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null

  await admin.from('analytics_visitors').upsert({ visitor_hash: visitorHash, last_seen_at: now.toISOString() }, { onConflict: 'visitor_hash' })
  if (!isFresh) await admin.from('analytics_sessions').insert({ id: sessionId, visitor_hash: visitorHash, user_id: userId, started_at: now.toISOString(), last_seen_at: now.toISOString() })

  const { count } = await admin.from('analytics_events').select('id', { count: 'exact', head: true }).eq('session_id', sessionId).gte('occurred_at', new Date(now.getTime() - 60_000).toISOString())
  if ((count ?? 0) >= 60) return { configured: true, inserted: false, rateLimited: true, cookies }

  const { error } = await admin.from('analytics_events').insert({ id: input.id, session_id: sessionId, visitor_hash: visitorHash, user_id: userId, event_name: input.eventName, path: input.path, entity_type: input.entityType ?? null, entity_id: input.entityId ?? null, metadata: input.metadata ?? {}, occurred_at: now.toISOString() })
  if (error?.code === '23505') return { configured: true, inserted: false, duplicate: true, cookies }
  if (error) throw error

  const sessionUpdate: { last_seen_at: string; page_view_count?: number; download_count?: number } = { last_seen_at: now.toISOString() }
  if (input.eventName === 'page_view') sessionUpdate.page_view_count = (existingSession?.page_view_count ?? 0) + 1
  if (input.eventName === 'document_download') sessionUpdate.download_count = (existingSession?.download_count ?? 0) + 1
  await admin.from('analytics_sessions').update(sessionUpdate).eq('id', sessionId)

  let viewCount: number | null = null
  if (input.eventName === 'page_view' && input.entityType === 'case' && input.entityId) {
    await admin.rpc('increment_case_view', { p_case_id: input.entityId })
    const { data } = await admin.from('case_studies').select('view_count').eq('id', input.entityId).maybeSingle()
    viewCount = data?.view_count ?? null
    if (userId) await admin.from('user_case_views').upsert({ user_id: userId, case_id: input.entityId, viewed_at: now.toISOString() }, { onConflict: 'user_id,case_id' })
  }
  return { configured: true, inserted: true, viewCount, cookies }
}

export function applyAnalyticsCookies(response: NextResponse, values: CookieValue[]) {
  for (const cookie of values) response.cookies.set(cookie.name, cookie.value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: cookie.maxAge })
  return response
}
