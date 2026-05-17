'use client'

import Link from 'next/link'
import { Clipboard, MonitorPlay, Share2 } from 'lucide-react'
import { useState } from 'react'

type CaseActionsProps = {
  slug: string
  title: string
}

export function CaseActions({ slug, title }: CaseActionsProps) {
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  async function handleShare() {
    const url = window.location.href

    setShareError(null)

    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }

      if (!navigator.clipboard) {
        throw new Error('Clipboard is not available.')
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return

      setShareError(
        'Could not copy the link. Please copy the URL from the address bar.',
      )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
        >
          {copied ? (
            <Clipboard className="h-4 w-4" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          {copied ? 'คัดลอกลิงก์แล้ว' : 'Share'}
        </button>

        <Link
          href={`/cases/${slug}/present`}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <MonitorPlay className="h-4 w-4" />
          Presentation
        </Link>
      </div>
      {shareError ? (
        <p className="text-sm font-semibold text-red-600" role="status">
          {shareError}
        </p>
      ) : null}
    </div>
  )
}
