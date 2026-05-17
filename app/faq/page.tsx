import { HelpCircle } from 'lucide-react'

import { PortalShell } from '@/src/components/portal-shell'
import { getHomePageData } from '@/src/lib/queries/home'

export const metadata = {
  title: 'FAQ',
}

export default async function FaqPage() {
  const { faqs } = await getHomePageData()

  return (
    <PortalShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                FAQ
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                คำถามที่พบบ่อย
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                รวมคำถามที่ทีมขายมักใช้ตอบลูกค้าเบื้องต้นก่อนประสานทีมเทคนิค
              </p>
            </div>
          </div>
        </section>

        {faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <article
                key={faq.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-bold text-slate-950">{faq.question}</h2>
                <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            ยังไม่มี FAQ ในระบบ
          </div>
        )}
      </div>
    </PortalShell>
  )
}
