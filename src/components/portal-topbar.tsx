'use client'

import Link from 'next/link'
import { Bell, HelpCircle, LogIn, Menu, Search, Slash } from 'lucide-react'

import { LogoutButton } from '@/src/components/logout-button'

export type PortalUser = {
  fullName?: string | null
  email?: string | null
  role?: string | null
}

type PortalTopbarProps = {
  onMenuClick: () => void
  user?: PortalUser | null
}

export function PortalTopbar({ onMenuClick, user }: PortalTopbarProps) {
  const displayName = user?.fullName ?? user?.email ?? 'ผู้ใช้งาน'
  const roleLabel = user?.role === 'admin' ? 'ผู้ดูแลระบบ' : user?.role === 'tech' ? 'ทีมเทคนิค' : 'ฝ่ายขาย'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-4 px-4 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          aria-label="เปิดเมนู"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form action="/search" className="min-w-0 flex-1 lg:max-w-3xl">
          <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              name="q"
              placeholder="ค้นหาเคส / ระบบ / ปัญหา / อุปกรณ์ / หน้างาน..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            />
            <span className="hidden h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 sm:inline-flex">
              <Slash className="h-3.5 w-3.5" />
            </span>
          </label>
        </form>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Link
            href="/guides"
            className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <HelpCircle className="h-5 w-5" />
            ช่วยเหลือ
          </Link>
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        </div>

        <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
          {user ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden min-w-0 lg:block">
                <div className="max-w-36 truncate text-sm font-bold text-slate-950">
                  {displayName}
                </div>
                <div className="text-xs text-slate-500">{roleLabel}</div>
              </div>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <LogIn className="h-4 w-4" />
              เข้าระบบผู้ดูแล
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
