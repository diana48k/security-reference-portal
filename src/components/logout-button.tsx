'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/src/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleLogout() {
    setIsSubmitting(true)
    setErrorMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signOut().catch((error: Error) => ({
      error,
    }))

    if (error) {
      setErrorMessage(error.message || 'Could not sign out. Please try again.')
      setIsSubmitting(false)
      return
    }

    router.replace('/login')
    router.refresh()
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogOut className="h-4 w-4" />
        {isSubmitting ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
      </button>
      {errorMessage ? (
        <p
          className="max-w-48 text-xs font-semibold text-red-600"
          role="status"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
