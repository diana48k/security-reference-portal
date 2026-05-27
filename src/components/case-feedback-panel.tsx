'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'

import { submitCaseFeedbackAction } from '@/src/lib/actions/case-activity'

type CaseFeedbackPanelProps = {
  caseId: string
  slug: string
  initialFeedback: boolean | null
  canFeedback: boolean
}

export function CaseFeedbackPanel({
  caseId,
  slug,
  initialFeedback,
  canFeedback,
}: CaseFeedbackPanelProps) {
  const [feedback, setFeedback] = useState<boolean | null>(initialFeedback)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!canFeedback) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="font-semibold text-slate-700">
          เคสนี้มีประโยชน์กับคุณหรือไม่?
        </div>
        <Link
          href={`/login?next=${encodeURIComponent(`/cases/${slug}`)}`}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          เข้าสู่ระบบเพื่อให้ feedback
        </Link>
      </div>
    )
  }

  function submit(nextFeedback: boolean) {
    setFeedback(nextFeedback)
    setErrorMessage(null)

    startTransition(async () => {
      try {
        await submitCaseFeedbackAction({
          caseId,
          slug,
          isUseful: nextFeedback,
        })
      } catch (error) {
        setFeedback(initialFeedback)
        setErrorMessage(
          error instanceof Error ? error.message : 'ไม่สามารถบันทึก feedback ได้',
        )
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="font-semibold text-slate-700">
          เคสนี้มีประโยชน์กับคุณหรือไม่?
        </div>
        {feedback !== null ? (
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            บันทึก feedback แล้ว
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-1 text-xs font-semibold text-red-600" role="status">
            {errorMessage}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit(true)}
          className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            feedback === true
              ? 'bg-emerald-600 text-white'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          มีประโยชน์
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit(false)}
          className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            feedback === false
              ? 'bg-red-600 text-white'
              : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
          ไม่มีประโยชน์
        </button>
      </div>
    </div>
  )
}
