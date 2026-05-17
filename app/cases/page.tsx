import { BriefcaseBusiness } from 'lucide-react'

import { CaseCard } from '@/src/components/case-card'
import { PortalShell } from '@/src/components/portal-shell'
import { getSearchPageData } from '@/src/lib/queries/search'

export const metadata = {
  title: 'เคสโครงการ',
}

export default async function ProjectCasesPage() {
  const data = await getSearchPageData({})

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                เคสโครงการ
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                คลังเคสงานติดตั้งทั้งหมด
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                รวมเคสที่เผยแพร่แล้วสำหรับทีมขาย ใช้ค้นหา เปรียบเทียบ และเปิดรายละเอียดประกอบการคุยกับลูกค้า
              </p>
            </div>
          </div>
        </section>

        {data.cases.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.cases.map((caseStudy) => (
              <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            ยังไม่มีเคสที่เผยแพร่ในระบบ
          </div>
        )}
      </div>
    </PortalShell>
  )
}
