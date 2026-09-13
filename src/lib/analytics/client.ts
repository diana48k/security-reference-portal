import type { AnalyticsEventName } from '@/src/types/application'

export function trackAnalytics(eventName: AnalyticsEventName, options: { path?: string; entityType?: string; entityId?: string; metadata?: Record<string, string | number | boolean | null> } = {}) {
  const body = JSON.stringify({ id: crypto.randomUUID(), eventName, path: options.path ?? window.location.pathname + window.location.search, entityType: options.entityType, entityId: options.entityId, metadata: options.metadata })
  void fetch('/api/analytics/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true })
}
