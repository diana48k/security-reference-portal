'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { trackAnalytics } from '@/src/lib/analytics/client'

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  useEffect(() => {
    if (/^\/cases\/[^/]+$/.test(pathname)) return
    trackAnalytics('page_view', { path: `${pathname}${query ? `?${query}` : ''}` })
  }, [pathname, query])
  return null
}
