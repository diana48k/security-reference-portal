'use client'

import { useFormStatus } from 'react-dom'

type SubmitButtonProps = {
  children: React.ReactNode
  pendingText?: string
  className?: string
}

export function SubmitButton({
  children,
  pendingText = 'กำลังบันทึก...',
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        'rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400'
      }
    >
      {pending ? pendingText : children}
    </button>
  )
}
