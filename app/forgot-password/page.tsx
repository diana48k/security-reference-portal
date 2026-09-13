import { BrandLogo } from '@/src/components/brand-logo'
import { ForgotPasswordForm } from '@/src/components/password-forms'

export const metadata = { title: 'ลืมรหัสผ่าน' }

export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12"><section className="w-full max-w-md"><BrandLogo /><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold text-slate-950">ลืมรหัสผ่าน</h1><p className="mt-3 mb-7 text-sm leading-6 text-slate-600">กรอกอีเมลที่ใช้ในระบบ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่โดยไม่เปิดเผยว่ามีบัญชีนี้หรือไม่</p><ForgotPasswordForm /></div></section></main>
}
