import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'Cases | Security Reference Portal',
}

export default function AdminCasesPage() {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Cases</h1>
          <p className="mt-2 text-slate-600">
            Case management will be added in the next step.
          </p>
        </div>
        <Link
          href="/admin/cases/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          New case
        </Link>
      </div>
    </section>
  )
}
