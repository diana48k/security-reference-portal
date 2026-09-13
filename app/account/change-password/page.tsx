import { BrandLogo } from '@/src/components/brand-logo'
import { ChangePasswordForm } from '@/src/components/password-forms'
import { getRequiredActiveUser } from '@/src/lib/queries/auth'

export const metadata = { title: 'เปลี่ยนรหัสผ่าน' }

export default async function ChangePasswordPage({ searchParams }: { searchParams: Promise<{ required?: string; recovery?: string }> }) {
  const [{ required, recovery }, { profile }] = await Promise.all([searchParams, getRequiredActiveUser()])
  const isRequired = required === '1' || profile.must_change_password
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12"><section className="w-full max-w-md"><BrandLogo /><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h1 className="text-2xl font-bold text-slate-950">{isRequired ? 'ตั้งรหัสผ่านใหม่ก่อนใช้งาน' : 'เปลี่ยนรหัสผ่าน'}</h1><p className="mt-3 mb-7 text-sm leading-6 text-slate-600">ใช้รหัสผ่านที่คาดเดายากและไม่ซ้ำกับบริการอื่น</p><ChangePasswordForm omitCurrent={isRequired || recovery === '1'} /></div></section></main>
}
