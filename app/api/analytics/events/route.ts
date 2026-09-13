import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { applyAnalyticsCookies, recordAnalyticsEvent } from '@/src/lib/analytics/server'
import { ANALYTICS_EVENT_NAMES } from '@/src/types/application'

const bodySchema = z.object({ id: z.string().uuid(), eventName: z.enum(ANALYTICS_EVENT_NAMES), path: z.string().startsWith('/').max(500), entityType: z.string().max(50).optional(), entityId: z.string().max(200).optional(), metadata: z.record(z.string(), z.union([z.string().max(500), z.number(), z.boolean(), z.null()])).optional() })

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 8192) return NextResponse.json({ error: 'Analytics event is too large' }, { status: 413 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid analytics event' }, { status: 400 })
  try {
    const result = await recordAnalyticsEvent(request, parsed.data)
    const response = NextResponse.json({ recorded: result.inserted, configured: result.configured, viewCount: result.viewCount ?? null }, { status: result.rateLimited ? 429 : result.configured ? 200 : 503 })
    return applyAnalyticsCookies(response, result.cookies)
  } catch (error) {
    console.error('Unable to record analytics event.', error)
    return NextResponse.json({ error: 'Unable to record event' }, { status: 500 })
  }
}
