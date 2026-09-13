import { Users } from 'lucide-react'

import { AdminUserManagement } from '@/src/components/admin-user-management'
import { getCurrentAdminUser } from '@/src/lib/queries/admin'
import { getManagedUsers } from '@/src/lib/queries/admin-users'

export const metadata = { title: 'จัดการผู้ใช้' }

export default async function AdminUsersPage() {
  const [{ user }, users] = await Promise.all([getCurrentAdminUser(), getManagedUsers()])
  return <div className="space-y-6"><section className="rounded-2xl bg-slate-950 p-8 text-white shadow-sm"><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950"><Users className="h-6 w-6" /></div><div><p className="text-sm font-semibold uppercase tracking-wide text-slate-400">ผู้ดูแลระบบ</p><h1 className="mt-2 text-2xl font-bold">จัดการผู้ใช้</h1><p className="mt-3 text-slate-300">สร้างและแก้ไขผู้ใช้ เปลี่ยนสิทธิ์ ออกรหัสชั่วคราว ระงับ คืนสถานะ และลบถาวร พร้อม audit log</p></div></div></section><AdminUserManagement users={users} currentUserId={user.id} /></div>
}
