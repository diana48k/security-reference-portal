'use client'

import { useActionState, useMemo, useState } from 'react'
import { Check, Clipboard, KeyRound, LoaderCircle, Search, ShieldBan, ShieldCheck, Trash2, UserPlus } from 'lucide-react'

import { manageUserAction, type UserAdminActionState } from '@/src/lib/actions/admin-users'
import type { ManagedUser, UserRole } from '@/src/types/application'

const initialState: UserAdminActionState = {}
const roleLabels: Record<UserRole, string> = { admin: 'ผู้ดูแลระบบ', tech: 'ทีมเทคนิค', sales: 'ฝ่ายขาย', viewer: 'ผู้ชม' }

export function AdminUserManagement({ users, currentUserId }: { users: ManagedUser[]; currentUserId: string }) {
  const [state, action, pending] = useActionState(manageUserAction, initialState)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [copied, setCopied] = useState(false)
  const filtered = useMemo(() => users.filter((user) => `${user.fullName ?? ''} ${user.email}`.toLowerCase().includes(query.toLowerCase()) && (role === 'all' || user.role === role) && (status === 'all' || (status === 'active') === user.isActive)), [users, query, role, status])
  const pages = Math.max(1, Math.ceil(filtered.length / 10))
  const safePage = Math.min(page, pages)
  const visible = filtered.slice((safePage - 1) * 10, safePage * 10)

  async function copyPassword() {
    if (!state.temporaryPassword) return
    await navigator.clipboard.writeText(state.temporaryPassword)
    setCopied(true)
  }

  return <div className="space-y-6">
    {state.error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.error}</div> : null}
    {state.success ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><p className="font-semibold">{state.success}</p>{state.temporaryPassword ? <div className="mt-3 flex items-center gap-2"><code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-white px-3 py-2 font-mono text-slate-950">{state.temporaryPassword}</code><button type="button" onClick={copyPassword} className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 font-semibold text-white">{copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</button></div> : null}</div> : null}
    <details className="rounded-2xl border border-slate-200 bg-white shadow-sm" open={users.length === 0}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-5 font-bold text-slate-950"><UserPlus className="h-5 w-5 text-blue-700" />สร้างผู้ใช้ใหม่</summary>
      <form action={action} className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-4"><input type="hidden" name="intent" value="create" /><Field name="fullName" label="ชื่อ-นามสกุล" required /><Field name="email" label="อีเมล" type="email" required /><RoleSelect /><div className="flex items-end"><ActionButton pending={pending} label="สร้างผู้ใช้" icon={UserPlus} /></div></form>
    </details>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-[1fr_180px_180px]">
        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="ค้นหาชื่อหรืออีเมล" className="min-w-0 flex-1 outline-none" /></label>
        <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1) }} className="h-11 rounded-xl border border-slate-300 px-3"><option value="all">ทุกสิทธิ์</option>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="h-11 rounded-xl border border-slate-300 px-3"><option value="all">ทุกสถานะ</option><option value="active">ใช้งาน</option><option value="suspended">ระงับ</option></select>
      </div>
      <div className="divide-y divide-slate-100">{visible.map((user) => <UserEditor key={user.id} user={user} currentUserId={currentUserId} action={action} pending={pending} />)}{visible.length === 0 ? <div className="p-12 text-center text-slate-500">ไม่พบผู้ใช้ตามตัวกรอง</div> : null}</div>
      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-600"><span>{filtered.length.toLocaleString('th-TH')} ผู้ใช้</span><div className="flex items-center gap-2"><button type="button" disabled={safePage <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">ก่อนหน้า</button><span>{safePage} / {pages}</span><button type="button" disabled={safePage >= pages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">ถัดไป</button></div></div>
    </section>
  </div>
}

function UserEditor({ user, currentUserId, action, pending }: { user: ManagedUser; currentUserId: string; action: (payload: FormData) => void; pending: boolean }) {
  return <details><summary className="grid cursor-pointer list-none gap-3 p-5 md:grid-cols-[1fr_180px_160px_160px] md:items-center"><div><div className="font-bold text-slate-950">{user.fullName ?? 'ยังไม่ระบุชื่อ'} {user.id === currentUserId ? <span className="text-xs text-blue-700">(คุณ)</span> : null}</div><div className="mt-1 text-sm text-slate-500">{user.email}</div></div><span className="text-sm font-semibold text-slate-700">{roleLabels[user.role]}</span><span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{user.isActive ? 'ใช้งาน' : 'ระงับ'}</span><span className="text-xs text-slate-500">เข้าใช้ล่าสุด {formatDate(user.lastSignInAt)}</span></summary>
    <form action={action} className="grid gap-4 bg-slate-50 p-5 md:grid-cols-3"><input type="hidden" name="id" value={user.id} /><Field name="fullName" label="ชื่อ-นามสกุล" defaultValue={user.fullName ?? ''} required /><Field name="email" label="อีเมล" type="email" defaultValue={user.email} required /><RoleSelect defaultValue={user.role} /><div className="md:col-span-3 flex flex-wrap gap-2"><ActionButton pending={pending} label="บันทึกการแก้ไข" icon={ShieldCheck} intent="update" /><button name="intent" value="reset_password" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-800"><KeyRound className="h-4 w-4" />สร้างรหัสชั่วคราวใหม่</button><button name="intent" value={user.isActive ? 'suspend' : 'restore'} disabled={pending || user.id === currentUserId} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 disabled:opacity-40"><ShieldBan className="h-4 w-4" />{user.isActive ? 'ระงับ' : 'คืนสถานะ'}</button></div>{user.id !== currentUserId ? <div className="md:col-span-3 rounded-xl border border-red-200 bg-white p-4"><label className="text-xs font-semibold text-red-800">พิมพ์ {user.email} เพื่อยืนยันการลบถาวร</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input name="confirmation" className="h-10 flex-1 rounded-lg border border-red-200 px-3 outline-none focus:ring-2 focus:ring-red-100" /><button name="intent" value="delete" disabled={pending} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white"><Trash2 className="h-4 w-4" />ลบถาวร</button></div></div> : null}</form>
  </details>
}

function Field({ name, label, type = 'text', defaultValue, required }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean }) { return <label className="text-sm font-semibold text-slate-700">{label}<input name={name} type={type} defaultValue={defaultValue} required={required} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label> }
function RoleSelect({ defaultValue = 'viewer' }: { defaultValue?: UserRole }) { return <label className="text-sm font-semibold text-slate-700">สิทธิ์<select name="role" defaultValue={defaultValue} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> }
function ActionButton({ pending, label, icon: Icon, intent }: { pending: boolean; label: string; icon: typeof UserPlus; intent?: string }) { return <button name={intent ? 'intent' : undefined} value={intent} disabled={pending} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white disabled:bg-slate-400">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}{label}</button> }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value)) : '—' }
