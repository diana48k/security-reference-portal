'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Star } from 'lucide-react'

import { toggleFavoriteAction } from '@/src/lib/actions/case-activity'

type FavoriteCaseButtonProps = {
  caseId: string
  slug: string
  isFavorited: boolean
  canFavorite: boolean
}

export function FavoriteCaseButton({
  caseId,
  slug,
  isFavorited,
  canFavorite,
}: FavoriteCaseButtonProps) {
  const [favorite, setFavorite] = useState(isFavorited)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!canFavorite) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/cases/${slug}`)}`}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Star className="h-4 w-4" />
        บันทึกเป็นรายการโปรด
      </Link>
    )
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          const nextFavorite = !favorite
          setFavorite(nextFavorite)
          setErrorMessage(null)

          startTransition(async () => {
            try {
              await toggleFavoriteAction({
                caseId,
                slug,
                nextFavorite,
              })
            } catch (error) {
              setFavorite(!nextFavorite)
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : 'ไม่สามารถบันทึกรายการโปรดได้',
              )
            }
          })
        }}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
          favorite
            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <Star className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
        {favorite ? 'อยู่ในรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
      </button>
      {errorMessage ? (
        <p className="text-sm font-semibold text-red-600" role="status">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
