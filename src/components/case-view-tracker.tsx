'use client'

import { useEffect } from 'react'

import { recordCaseViewAction } from '@/src/lib/actions/case-activity'

type CaseViewTrackerProps = {
  caseId: string
}

export function CaseViewTracker({ caseId }: CaseViewTrackerProps) {
  useEffect(() => {
    void recordCaseViewAction(caseId)
  }, [caseId])

  return null
}
