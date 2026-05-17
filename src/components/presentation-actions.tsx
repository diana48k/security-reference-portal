'use client'

import { Clipboard, Download, EyeOff, Eye } from 'lucide-react'
import { useState } from 'react'

type PresentationActionsProps = {
  title: string
}

export function PresentationActions({ title }: PresentationActionsProps) {
  const [copied, setCopied] = useState(false)
  const [hideBudget, setHideBudget] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  async function copyLink() {
    setCopyError(null)

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard is not available.')
      }

      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopyError(
        'Could not copy the link. Please copy the URL from the address bar.',
      )
    }
  }

  function downloadPdf() {
    window.print()
  }

  function toggleBudget() {
    const nextValue = !hideBudget
    setHideBudget(nextValue)
    document.documentElement.dataset.hideBudget = nextValue ? 'true' : 'false'
  }

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2 print:hidden"
      aria-label={`${title} presentation actions`}
    >
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
      >
        <Clipboard className="h-4 w-4" />
        {copied ? 'Copied' : 'Copy Link'}
      </button>
      <button
        type="button"
        onClick={downloadPdf}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
      >
        <Download className="h-4 w-4" />
        Download PDF
      </button>
      <button
        type="button"
        onClick={toggleBudget}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
      >
        {hideBudget ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
        {hideBudget ? 'Show Budget' : 'Hide Budget'}
      </button>
      {copyError ? (
        <p
          className="basis-full text-right text-sm font-semibold text-red-300"
          role="status"
        >
          {copyError}
        </p>
      ) : null}
    </div>
  )
}
