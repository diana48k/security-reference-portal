import 'server-only'

import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import type { AdminDashboardMetrics, AnalyticsDateRange, AnalyticsRankingItem, AnalyticsTrendPoint, AnalyticsUserActivity } from '@/src/types/application'

type EventRow = { id: string; session_id: string; visitor_hash: string; user_id: string | null; event_name: string; path: string; entity_type: string | null; entity_id: string | null; metadata: Record<string, unknown>; occurred_at: string }
type SessionRow = { id: string; user_id: string | null; started_at: string; last_seen_at: string }

export function resolveAnalyticsRange(input: { range?: string; start?: string; end?: string }): AnalyticsDateRange {
  const today = bangkokDay(new Date())
  const days = ['7', '30', '90'].includes(input.range ?? '') ? Number(input.range) : 30
  if (input.range === 'custom' && /^\d{4}-\d{2}-\d{2}$/.test(input.start ?? '') && /^\d{4}-\d{2}-\d{2}$/.test(input.end ?? '') && input.start! <= input.end!) {
    const span = Math.min(90, Math.floor((Date.parse(`${input.end}T00:00:00+07:00`) - Date.parse(`${input.start}T00:00:00+07:00`)) / 86_400_000) + 1)
    return { start: addDays(input.end!, -(span - 1)), end: input.end!, days: span }
  }
  return { start: addDays(today, -(days - 1)), end: today, days }
}

export async function getAdminDashboardMetrics(range: AnalyticsDateRange): Promise<AdminDashboardMetrics> {
  const empty = emptyMetrics(range)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.ANALYTICS_HASH_SECRET) return empty
  const admin = createSupabaseAdminClient()
  const start = `${range.start}T00:00:00+07:00`
  const end = `${addDays(range.end, 1)}T00:00:00+07:00`
  const todayStart = `${bangkokDay(new Date())}T00:00:00+07:00`
  const [eventsResult, sessionsResult, todayResult, authResult] = await Promise.all([
    admin.from('analytics_events').select('id, session_id, visitor_hash, user_id, event_name, path, entity_type, entity_id, metadata, occurred_at').gte('occurred_at', start).lt('occurred_at', end).order('occurred_at', { ascending: true }).limit(10000),
    admin.from('analytics_sessions').select('id, user_id, started_at, last_seen_at').gte('started_at', start).lt('started_at', end).limit(10000),
    admin.from('analytics_events').select('visitor_hash').gte('occurred_at', todayStart).limit(10000),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])
  if (eventsResult.error || sessionsResult.error || todayResult.error || authResult.error) return empty
  const events = (eventsResult.data ?? []) as EventRow[]
  const sessions = (sessionsResult.data ?? []) as SessionRow[]
  const pageViews = events.filter((event) => event.event_name === 'page_view')
  const downloads = events.filter((event) => event.event_name === 'document_download')
  const searches = events.filter((event) => event.event_name === 'search')
  const feedback = events.filter((event) => event.event_name === 'feedback_submit')
  const visitors = new Set(events.map((event) => event.visitor_hash))
  const userMap = new Map(authResult.data.users.map((user) => [user.id, { email: user.email ?? null, fullName: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : null }]))

  const trendMap = new Map<string, AnalyticsTrendPoint>()
  for (let day = range.start; day <= range.end; day = addDays(day, 1)) trendMap.set(day, { date: day, visitors: 0, sessions: 0, pageViews: 0, downloads: 0 })
  const dayVisitors = new Map<string, Set<string>>(); const daySessions = new Map<string, Set<string>>()
  for (const event of events) { const day = bangkokDay(new Date(event.occurred_at)); dayVisitors.set(day, (dayVisitors.get(day) ?? new Set()).add(event.visitor_hash)); daySessions.set(day, (daySessions.get(day) ?? new Set()).add(event.session_id)); const point = trendMap.get(day); if (point) { if (event.event_name === 'page_view') point.pageViews++; if (event.event_name === 'document_download') point.downloads++ } }
  for (const [day, point] of trendMap) { point.visitors = dayVisitors.get(day)?.size ?? 0; point.sessions = daySessions.get(day)?.size ?? 0 }

  const userActivityMap = new Map<string, AnalyticsUserActivity>()
  for (const event of events) if (event.user_id) { const identity = userMap.get(event.user_id); const item = userActivityMap.get(event.user_id) ?? { userId: event.user_id, fullName: identity?.fullName ?? null, email: identity?.email ?? null, sessions: 0, pageViews: 0, downloads: 0, lastActivityAt: null }; if (event.event_name === 'page_view') item.pageViews++; if (event.event_name === 'document_download') item.downloads++; if (!item.lastActivityAt || item.lastActivityAt < event.occurred_at) item.lastActivityAt = event.occurred_at; userActivityMap.set(event.user_id, item) }
  const userSessions = new Map<string, Set<string>>()
  for (const event of events) if (event.user_id) userSessions.set(event.user_id, (userSessions.get(event.user_id) ?? new Set()).add(event.session_id))
  for (const [userId, sessionIds] of userSessions) { const item = userActivityMap.get(userId); if (item) item.sessions = sessionIds.size }

  const averageSessionMinutes = sessions.length ? sessions.reduce((sum, session) => sum + Math.max(0, new Date(session.last_seen_at).getTime() - new Date(session.started_at).getTime()), 0) / sessions.length / 60_000 : 0
  const returning = new Map<string, Set<string>>()
  for (const event of events) returning.set(event.visitor_hash, (returning.get(event.visitor_hash) ?? new Set()).add(event.session_id))
  return {
    configured: true, range, visitors: visitors.size, visitorsToday: new Set((todayResult.data ?? []).map((row) => row.visitor_hash)).size,
    sessions: new Set(events.map((event) => event.session_id)).size, pageViews: pageViews.length, pagesPerSession: pageViews.length / Math.max(1, new Set(events.map((event) => event.session_id)).size), downloads: downloads.length,
    presentationExports: events.filter((event) => event.event_name === 'presentation_export').length, activeUsers: new Set(events.flatMap((event) => event.user_id ? [event.user_id] : [])).size,
    returningVisitorRate: visitors.size ? [...returning.values()].filter((sessionIds) => sessionIds.size > 1).length / visitors.size * 100 : 0, averageSessionMinutes,
    trend: [...trendMap.values()], topPages: rank(pageViews.map((event) => event.path)), topCases: rank(pageViews.filter((event) => event.entity_type === 'case').map((event) => String(event.entity_id))), topDocuments: rank(downloads.map((event) => String(event.metadata.fileName || event.entity_id))), topSearches: rank(searches.map((event) => String(event.metadata.term ?? ''))),
    searches: searches.length, noResultRate: searches.length ? searches.filter((event) => event.metadata.hasResults === false).length / searches.length * 100 : 0, favoriteToggles: events.filter((event) => event.event_name === 'favorite_toggle').length,
    usefulFeedbackRate: feedback.length ? feedback.filter((event) => event.metadata.useful === true).length / feedback.length * 100 : 0,
    userActivity: [...userActivityMap.values()].sort((a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? '')).slice(0, 50),
  }
}

function emptyMetrics(range: AnalyticsDateRange): AdminDashboardMetrics { return { configured: false, range, visitors: 0, visitorsToday: 0, sessions: 0, pageViews: 0, pagesPerSession: 0, downloads: 0, presentationExports: 0, activeUsers: 0, returningVisitorRate: 0, averageSessionMinutes: 0, trend: [], topPages: [], topCases: [], topDocuments: [], topSearches: [], searches: 0, noResultRate: 0, favoriteToggles: 0, usefulFeedbackRate: 0, userActivity: [] } }
function rank(values: string[]): AnalyticsRankingItem[] { const counts = new Map<string, number>(); for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) ?? 0) + 1); return [...counts].map(([key, value]) => ({ key, label: key, value })).sort((a, b) => b.value - a.value).slice(0, 10) }
function bangkokDay(date: Date) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date) }
function addDays(day: string, amount: number) { const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0, 10) }
