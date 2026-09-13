'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Bell, BellRing, CheckCheck, LogIn } from 'lucide-react'

import { markAllNotificationsRead, markNotificationRead } from '@/src/lib/actions/notifications'
import { createClient } from '@/src/lib/supabase/client'
import type { PortalNotification, PortalUser } from '@/src/types/application'

export function NotificationBell({ user, initialNotifications }: { user?: PortalUser | null; initialNotifications: PortalNotification[] }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const container = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((item) => !item.readAt).length

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    const channel = supabase.channel(`notifications:${user.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
      const row = payload.new as { id: string; event_type: PortalNotification['eventType']; title: string; message: string | null; href: string; created_at: string }
      setNotifications((items) => [{ id: row.id, eventType: row.event_type, title: row.title, message: row.message, href: row.href, createdAt: row.created_at, readAt: null }, ...items].slice(0, 20))
    }).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [user])
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  async function refreshNotifications() {
    if (!user) return
    const supabase = createClient()
    const [{ data: items }, { data: reads }] = await Promise.all([
      supabase.from('notifications').select('id, event_type, title, message, href, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('notification_reads').select('notification_id, read_at').eq('user_id', user.id),
    ])
    const readMap = new Map((reads ?? []).map((item) => [item.notification_id, item.read_at]))
    setNotifications((items ?? []).map((item) => ({ id: item.id, eventType: item.event_type, title: item.title, message: item.message, href: item.href, createdAt: item.created_at, readAt: readMap.get(item.id) ?? null })))
  }
  function toggle() { setOpen((value) => !value); if (!open && user) { void refreshNotifications(); router.refresh() } }
  function read(id: string) { setNotifications((items) => items.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item)); startTransition(() => void markNotificationRead(id)); setOpen(false) }
  function readAll() { const now = new Date().toISOString(); setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? now }))); startTransition(() => void markAllNotificationsRead()) }

  return <div ref={container} className="relative">
    <button type="button" onClick={toggle} className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100" aria-label={`การแจ้งเตือน${unread ? ` ยังไม่อ่าน ${unread} รายการ` : ''}`} aria-expanded={open}>{unread ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}{unread ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-[11px] font-bold leading-5 text-white">{unread > 99 ? '99+' : unread}</span> : null}</button>
    {open ? <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="font-bold text-slate-950">การแจ้งเตือน</h2>{user && unread ? <button type="button" onClick={readAll} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"><CheckCheck className="h-4 w-4" />อ่านทั้งหมด</button> : null}</div>{!user ? <div className="p-6 text-center"><LogIn className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-3 text-sm text-slate-600">เข้าสู่ระบบเพื่อรับการแจ้งเตือนล่าสุด</p><Link href="/login" className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">เข้าสู่ระบบ</Link></div> : notifications.length ? <div className="max-h-96 overflow-y-auto">{notifications.map((item) => <Link key={item.id} href={item.href} onClick={() => read(item.id)} className={`block border-b border-slate-100 px-4 py-3 hover:bg-slate-50 ${item.readAt ? '' : 'bg-blue-50/70'}`}><div className="flex gap-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? 'bg-slate-200' : 'bg-blue-600'}`} /><div><p className="text-sm font-bold text-slate-900">{item.title}</p>{item.message ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{item.message}</p> : null}<p className="mt-1 text-[11px] text-slate-400">{new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</p></div></div></Link>)}</div> : <p className="p-8 text-center text-sm text-slate-500">ยังไม่มีการแจ้งเตือน</p>}</div> : null}
  </div>
}
