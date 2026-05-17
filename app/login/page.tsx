import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

import { LoginForm } from '@/src/components/login-form'

export const metadata = {
  title: 'Login',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            เข้าระบบผู้ดูแล
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            สำหรับทีมเทคนิคหรือผู้ดูแลระบบที่ต้องจัดการข้อมูลเคส หมวดระบบ FAQ และเอกสาร
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <Link
          href="/"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      </section>
    </main>
  )
}
