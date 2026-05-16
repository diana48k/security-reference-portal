'use client'

import { Archive, EyeOff, Send, Trash2, Undo2 } from 'lucide-react'

import { ConfirmActionButton } from '@/src/components/confirm-action-button'
import { SubmitButton } from '@/src/components/submit-button'
import {
  deleteCaseStudyAction,
  updateCaseStatusAction,
} from '@/src/lib/actions/cases'

type AdminCaseStatusActionsProps = {
  id: string
  status: string
  title: string
}

export function AdminCaseStatusActions({
  id,
  status,
  title,
}: AdminCaseStatusActionsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Status actions</h2>
      <p className="mt-1 text-sm text-slate-600">
        Current status: <span className="font-semibold">{status}</span>
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {status !== 'published' ? (
          <StatusForm id={id} status="published" label="Publish" icon="publish" />
        ) : (
          <StatusForm id={id} status="draft" label="Unpublish" icon="unpublish" />
        )}

        {status !== 'archived' ? (
          <StatusForm id={id} status="archived" label="Archive" icon="archive" />
        ) : (
          <StatusForm id={id} status="draft" label="Restore draft" icon="restore" />
        )}

        <form action={deleteCaseStudyAction}>
          <input type="hidden" name="id" value={id} />
          <ConfirmActionButton
            confirmMessage={`Delete "${title}"? This cannot be undone.`}
            pendingText="Deleting..."
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </ConfirmActionButton>
        </form>
      </div>
    </div>
  )
}

function StatusForm({
  id,
  status,
  label,
  icon,
}: {
  id: string
  status: 'draft' | 'published' | 'archived'
  label: string
  icon: 'publish' | 'unpublish' | 'archive' | 'restore'
}) {
  const Icon =
    icon === 'publish'
      ? Send
      : icon === 'unpublish'
        ? EyeOff
        : icon === 'archive'
          ? Archive
          : Undo2

  return (
    <form action={updateCaseStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton
        pendingText="Updating..."
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Icon className="h-4 w-4" />
        {label}
      </SubmitButton>
    </form>
  )
}
