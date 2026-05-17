import { Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Admin Login
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in with a Supabase user that has admin or tech role access.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
