import Link from 'next/link'
import { ShieldCheck, UserRound, Users } from 'lucide-react'

import { formatThaiDate } from '@/src/lib/case-utils'
import {
  getAdminUserProfiles,
  type AdminUserProfile,
} from '@/src/lib/queries/admin-users'

export const metadata = {
  title: 'จัดการผู้ใช้',
}

export default async function AdminUsersPage() {
  const profiles = await getAdminUserProfiles()

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-950 p-8 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              ผู้ดูแลระบบ
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              จัดการผู้ใช้
            </h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              ดูรายชื่อผู้ใช้และสิทธิ์จากตาราง profiles ปัจจุบัน การเชิญผู้ใช้หรือแก้สิทธิ์ยังควรทำผ่าน Supabase Auth เพื่อความปลอดภัย
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['ผู้ใช้ทั้งหมด', profiles.length],
          ['ผู้ดูแล/เทคนิค', profiles.filter((profile) => ['admin', 'tech'].includes(profile.role)).length],
          ['ฝ่ายขาย/ผู้ชม', profiles.filter((profile) => ['sales', 'viewer'].includes(profile.role)).length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-slate-950">
                {Number(value).toLocaleString('th-TH')}
              </div>
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-600">
              {label}
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              รายชื่อผู้ใช้
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {profiles.length.toLocaleString('th-TH')} โปรไฟล์
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            กลับแดชบอร์ด
          </Link>
        </div>

        {profiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">ผู้ใช้</th>
                  <th className="px-6 py-4 font-semibold">สิทธิ์</th>
                  <th className="px-6 py-4 font-semibold">สร้างเมื่อ</th>
                  <th className="px-6 py-4 font-semibold">อัปเดตล่าสุด</th>
                  <th className="px-6 py-4 font-semibold">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((profile) => (
                  <UserRow key={profile.id} profile={profile} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            ยังไม่มี profile ผู้ใช้ในระบบ
          </div>
        )}
      </section>
    </div>
  )
}

function UserRow({ profile }: { profile: AdminUserProfile }) {
  return (
    <tr className="align-top">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-950">
              {profile.full_name ?? 'ยังไม่ระบุชื่อ'}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              profile
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleClass(profile.role)}`}>
          {getRoleLabel(profile.role)}
        </span>
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">
        {formatThaiDate(profile.created_at)}
      </td>
      <td className="px-6 py-5 text-sm text-slate-600">
        {formatThaiDate(profile.updated_at)}
      </td>
      <td className="px-6 py-5 font-mono text-xs text-slate-500">
        {profile.id}
      </td>
    </tr>
  )
}

function getRoleLabel(role: string) {
  const roleMap: Record<string, string> = {
    admin: 'ผู้ดูแลระบบ',
    tech: 'ทีมเทคนิค',
    sales: 'ฝ่ายขาย',
    viewer: 'ผู้ชม',
  }

  return roleMap[role] ?? role
}

function getRoleClass(role: string) {
  const classMap: Record<string, string> = {
    admin: 'bg-red-50 text-red-700',
    tech: 'bg-blue-50 text-blue-700',
    sales: 'bg-emerald-50 text-emerald-700',
    viewer: 'bg-slate-100 text-slate-700',
  }

  return classMap[role] ?? 'bg-slate-100 text-slate-700'
}
