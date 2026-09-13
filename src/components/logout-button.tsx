'use client'

import { LogOut } from 'lucide-react'
import { useFormStatus } from 'react-dom'

import { logoutAction } from '@/src/lib/actions/auth'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"><LogOut className="h-4 w-4" />{pending ? 'กำลังออก...' : 'ออกจากระบบ'}</button>
}

export function LogoutButton() {
  return <form action={logoutAction}><SubmitButton /></form>
}
