'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { Eye, EyeOff, LoaderCircle, Mail } from 'lucide-react'

import { changePasswordAction, requestPasswordResetAction, type AuthActionState } from '@/src/lib/actions/auth'

const initialState: AuthActionState = {}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState)
  return <form action={action} className="space-y-5">
    <div><label htmlFor="email" className="text-sm font-semibold text-slate-700">อีเมล</label><div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"><Mail className="h-5 w-5 text-slate-400" /><input id="email" name="email" type="email" required autoFocus autoComplete="email" className="h-12 w-full outline-none" /></div></div>
    {state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
    {state.success ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{state.success}</p> : null}
    <button disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">{pending && <LoaderCircle className="h-5 w-5 animate-spin" />}{pending ? 'กำลังส่ง...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}</button>
    <Link href="/login" className="block text-center text-sm font-semibold text-blue-700 hover:underline">กลับหน้าเข้าสู่ระบบ</Link>
  </form>
}

export function ChangePasswordForm({ omitCurrent }: { omitCurrent?: boolean }) {
  const [state, action, pending] = useActionState(changePasswordAction, initialState)
  const [show, setShow] = useState(false)
  return <form action={action} className="space-y-4">
    {!omitCurrent ? <PasswordField name="currentPassword" label="รหัสผ่านปัจจุบัน" show={show} required /> : null}
    <PasswordField name="password" label="รหัสผ่านใหม่" show={show} autoComplete="new-password" />
    <PasswordField name="confirmPassword" label="ยืนยันรหัสผ่านใหม่" show={show} autoComplete="new-password" />
    <button type="button" onClick={() => setShow((value) => !value)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}</button>
    <p className="text-xs leading-5 text-slate-500">อย่างน้อย 12 ตัวอักษร และมีพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ</p>
    {state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
    <button disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">{pending && <LoaderCircle className="h-5 w-5 animate-spin" />}{pending ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}</button>
  </form>
}

function PasswordField({ name, label, show, autoComplete = 'current-password', required = true }: { name: string; label: string; show: boolean; autoComplete?: string; required?: boolean }) {
  return <div><label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</label><input id={name} name={name} type={show ? 'text' : 'password'} required={required} autoComplete={autoComplete} className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
}
