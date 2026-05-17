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
      <h2 className="text-lg font-bold text-slate-950">จัดการสถานะเคส</h2>
      <p className="mt-1 text-sm text-slate-600">
        สถานะปัจจุบัน:{' '}
        <span className="font-semibold">
          {status === 'published'
            ? 'เผยแพร่แล้ว'
            : status === 'draft'
              ? 'ฉบับร่าง'
              : status === 'archived'
                ? 'เก็บถาวร'
                : status}
        </span>
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {status !== 'published' ? (
          <StatusForm id={id} status="published" label="เผยแพร่" icon="publish" />
        ) : (
          <StatusForm id={id} status="draft" label="ยกเลิกเผยแพร่" icon="unpublish" />
        )}

        {status !== 'archived' ? (
          <StatusForm id={id} status="archived" label="เก็บถาวร" icon="archive" />
        ) : (
          <StatusForm id={id} status="draft" label="นำกลับเป็นฉบับร่าง" icon="restore" />
        )}

        <form action={deleteCaseStudyAction}>
          <input type="hidden" name="id" value={id} />
          <ConfirmActionButton
            confirmMessage={`ลบ "${title}" หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`}
            pendingText="กำลังลบ..."
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            ลบเคส
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
        pendingText="กำลังอัปเดต..."
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Icon className="h-4 w-4" />
        {label}
      </SubmitButton>
    </form>
  )
}
