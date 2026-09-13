'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, Lock, LogIn, Mail } from 'lucide-react'

import { loginAction, type AuthActionState } from '@/src/lib/actions/auth'

const initialState: AuthActionState = {}

export function LoginForm({ next = '/admin' }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">อีเมล</label>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
          <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <input id="email" name="email" type="email" autoComplete="email" required autoFocus className="h-12 w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400" placeholder="name@company.com" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">รหัสผ่าน</label>
          <Link href="/forgot-password" className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline">ลืมรหัสผ่าน?</Link>
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 bg-white pl-4 pr-2 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
          <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
          <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required className="h-12 min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-400" placeholder="กรอกรหัสผ่าน" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}>
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {state.error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 font-semibold text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-400">
        {pending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
        {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  )
}
