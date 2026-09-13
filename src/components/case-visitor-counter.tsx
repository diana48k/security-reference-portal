'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

type CaseVisitorCounterProps = {
  caseId: string
  slug: string
  initialViewCount: number | null
  isCollapsed?: boolean
}

const recentTrackedAtByCaseId = new Map<string, number>()
const TRACK_COOLDOWN_MS = 10_000

export function CaseVisitorCounter({
  caseId,
  slug,
  initialViewCount,
  isCollapsed,
}: CaseVisitorCounterProps) {
  const [viewCount, setViewCount] = useState(initialViewCount ?? 0)

  useEffect(() => {
    const now = Date.now()
    const recentTrackedAt = recentTrackedAtByCaseId.get(caseId)

    if (recentTrackedAt && now - recentTrackedAt < TRACK_COOLDOWN_MS) {
      return
    }

    recentTrackedAtByCaseId.set(caseId, now)

    let cancelled = false

    void fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: crypto.randomUUID(), eventName: 'page_view', path: `/cases/${slug}`, entityType: 'case', entityId: caseId }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled && typeof result.viewCount === 'number') {
          setViewCount(result.viewCount)
        }
      })
      .catch((error) => {
        console.error('Unable to update case visitor counter.', error)
      })

    return () => {
      cancelled = true
    }
  }, [caseId, slug])

  if (isCollapsed) {
    return (
      <div
        className="hidden justify-center border-t border-white/10 p-4 lg:flex"
        title={`Visitor Counter: ${viewCount.toLocaleString('th-TH')} ครั้ง`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
          <Eye className="h-5 w-5" />
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-white/10 p-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-100">
            <Eye className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Visitor Counter
            </div>
            <div className="mt-1 text-lg font-bold text-white">
              {viewCount.toLocaleString('th-TH')} ครั้ง
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
