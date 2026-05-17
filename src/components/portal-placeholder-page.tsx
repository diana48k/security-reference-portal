import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'

import { PortalShell } from '@/src/components/portal-shell'

type PortalPlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  withShell?: boolean
  actions?: Array<{
    href: string
    label: string
  }>
}

export function PortalPlaceholderPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  withShell = true,
  actions = [
    { href: '/search', label: 'ค้นหาเคสงานติดตั้ง' },
    { href: '/', label: 'กลับหน้าหลัก' },
  ],
}: PortalPlaceholderPageProps) {
  const content = (
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                {title}
              </h1>
              <p className="mt-4 leading-7 text-slate-600">{description}</p>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600 lg:w-80">
              <div className="font-bold text-slate-950">กำลังเตรียมข้อมูล</div>
              <p className="mt-2 leading-6">
                หน้านี้พร้อมอยู่ในระบบเมนูหลักแล้ว ทีมสามารถเชื่อมข้อมูลจริงเพิ่มในเฟสถัดไปได้โดยไม่ต้องเปลี่ยน navigation.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {action.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>
  )

  return withShell ? <PortalShell>{content}</PortalShell> : content
}
