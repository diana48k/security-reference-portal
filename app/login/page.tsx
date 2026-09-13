import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'

import { BrandLogo } from '@/src/components/brand-logo'
import { LoginForm } from '@/src/components/login-form'
import { getSafeNextPath } from '@/src/lib/auth-utils'

export const metadata = { title: 'เข้าสู่ระบบ' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams

  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[55%_45%]">
      <section className="relative min-h-60 overflow-hidden lg:min-h-screen" aria-label="ระบบคลังความรู้งานติดตั้ง">
        <Image src="/auth/corporate-login-background.png" alt="" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-slate-950/20" />
        <div className="relative flex h-full min-h-60 flex-col justify-between p-6 text-white sm:p-10 lg:min-h-screen lg:p-14">
          <BrandLogo tone="light" />
          <div className="hidden max-w-xl lg:block">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur"><ShieldCheck className="h-6 w-6" /></div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">ข้อมูลอ้างอิงที่ทีมงานเข้าถึงได้อย่างมั่นใจ</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-blue-100">ศูนย์รวมเคสโครงการ คู่มือติดตั้ง และเอกสารสำคัญ พร้อมสิทธิ์เข้าถึงที่เหมาะสมกับแต่ละทีม</p>
            <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-blue-50">
              {['ปลอดภัย', 'ค้นหาได้รวดเร็ว', 'อัปเดตแบบเรียลไทม์'].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300" />{item}</span>)}
            </div>
          </div>
        </div>
      </section>
      <section className="flex min-h-[calc(100vh-15rem)] items-center bg-slate-50 px-6 py-10 sm:px-12 lg:min-h-screen lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Secure access</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">ยินดีต้อนรับกลับ</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">เข้าสู่ระบบเพื่อใช้งานรายการโปรด การแจ้งเตือน และเครื่องมือสำหรับทีมงาน</p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"><LoginForm next={getSafeNextPath(next)} /></div>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" />กลับหน้าหลัก</Link>
        </div>
      </section>
    </main>
  )
}
