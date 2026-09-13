import 'server-only'

import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import type { NotificationEventType, PortalNotification } from '@/src/types/application'

type NotificationRow = { id: string; event_type: NotificationEventType; title: string; message: string | null; href: string; created_at: string }

export async function getRecentNotifications(userId: string): Promise<PortalNotification[]> {
  const supabase = await createSupabaseServerClient()
  const [{ data: items, error }, { data: reads }] = await Promise.all([
    supabase.from('notifications').select('id, event_type, title, message, href, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('notification_reads').select('notification_id, read_at').eq('user_id', userId),
  ])
  if (error) return []
  const readMap = new Map(((reads ?? []) as { notification_id: string; read_at: string }[]).map((read) => [read.notification_id, read.read_at]))
  return ((items ?? []) as NotificationRow[]).map((item) => ({ id: item.id, eventType: item.event_type, title: item.title, message: item.message, href: item.href, createdAt: item.created_at, readAt: readMap.get(item.id) ?? null }))
}
