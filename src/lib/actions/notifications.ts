'use server'

import { revalidatePath } from 'next/cache'

import { getRequiredActiveUser } from '@/src/lib/queries/auth'

export async function markNotificationRead(notificationId: string) {
  const { supabase, user } = await getRequiredActiveUser()
  await supabase.from('notification_reads').upsert({ notification_id: notificationId, user_id: user.id, read_at: new Date().toISOString() }, { onConflict: 'notification_id,user_id' })
  revalidatePath('/', 'layout')
}

export async function markAllNotificationsRead() {
  const { supabase, user } = await getRequiredActiveUser()
  const { data } = await supabase.from('notifications').select('id').limit(200)
  if (data?.length) await supabase.from('notification_reads').upsert(data.map((item) => ({ notification_id: item.id, user_id: user.id, read_at: new Date().toISOString() })), { onConflict: 'notification_id,user_id' })
  revalidatePath('/', 'layout')
}
