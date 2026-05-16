'use client'

import { useFormStatus } from 'react-dom'

type ConfirmActionButtonProps = {
  children: React.ReactNode
  confirmMessage: string
  pendingText?: string
  className?: string
}

export function ConfirmActionButton({
  children,
  confirmMessage,
  pendingText = 'Working...',
  className,
}: ConfirmActionButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault()
        }
      }}
      className={
        className ??
        'inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {pending ? pendingText : children}
    </button>
  )
}
