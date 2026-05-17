import Link from 'next/link'
import {
  ArrowRight,
  FileText,
  FolderKanban,
  HelpCircle,
  Plus,
  Tags,
} from 'lucide-react'

import { getAdminDashboardStats } from '@/src/lib/queries/admin'

const statLabels = [
  {
    key: 'totalCases',
    label: 'เคสทั้งหมด',
    icon: FolderKanban,
  },
  {
    key: 'publishedCases',
    label: 'เผยแพร่แล้ว',
    icon: FileText,
  },
  {
    key: 'draftCases',
    label: 'ฉบับร่าง',
    icon: FileText,
  },
  {
    key: 'categories',
    label: 'หมวดระบบ',
    icon: Tags,
  },
  {
    key: 'faqs',
    label: 'คำถาม FAQ',
    icon: HelpCircle,
  },
] as const

const quickLinks = [
  {
    href: '/admin/cases/new',
    label: 'เพิ่มเคสใหม่',
    icon: Plus,
  },
  {
    href: '/admin/cases',
    label: 'จัดการเคส',
    icon: FolderKanban,
  },
  {
    href: '/admin/taxonomy',
    label: 'จัดการหมวดระบบ',
    icon: Tags,
  },
  {
    href: '/admin/faqs',
    label: 'จัดการ FAQ',
    icon: HelpCircle,
  },
]

export const metadata = {
  title: 'แดชบอร์ดผู้ดูแล',
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          ผู้ดูแลระบบ
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          แดชบอร์ด
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          ภาพรวมข้อมูลเคส หมวดระบบ และเนื้อหาสนับสนุนทีมขาย
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statLabels.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold text-slate-950">
                  {stats[item.key].toLocaleString('en-US')}
                </div>
              </div>
              <div className="mt-4 text-sm font-semibold text-slate-600">
                {item.label}
              </div>
            </div>
          )
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">เมนูลัด</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {quickLinks.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="flex items-center gap-3 font-semibold text-slate-800">
                  <Icon className="h-5 w-5 text-slate-500" />
                  {item.label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-950" />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
