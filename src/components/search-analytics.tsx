'use client'

import { useEffect } from 'react'

import { trackAnalytics } from '@/src/lib/analytics/client'

export function SearchAnalytics({ term, resultCount }: { term: string; resultCount: number }) {
  useEffect(() => {
    if (term) trackAnalytics('search', { metadata: { term, resultCount, hasResults: resultCount > 0 } })
  }, [term, resultCount])
  return null
}
