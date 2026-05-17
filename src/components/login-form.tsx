'use client'

import { useState, type FormEvent } from 'react'
import { Lock, LogIn, Mail } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { createClient } from '@/src/lib/supabase/client'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next')
  const next =
    nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : '/admin'
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    const supabase = createClient()
    const { error } = await supabase.auth
      .signInWithPassword({
        email,
        password,
      })
      .catch((error: Error) => ({ error }))

    setIsSubmitting(false)

    if (error) {
      setErrorMessage(error.message || 'Could not sign in. Please try again.')
      return
    }

    router.replace(next)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">
          อีเมล
        </label>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 focus-within:border-slate-950">
          <Mail className="h-5 w-5 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-12 w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
            placeholder="admin@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-700"
        >
          รหัสผ่าน
        </label>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 focus-within:border-slate-950">
          <Lock className="h-5 w-5 text-slate-400" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-12 w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
            placeholder="กรอกรหัสผ่าน"
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <LogIn className="h-5 w-5" />
        {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
      </button>
    </form>
  )
}
