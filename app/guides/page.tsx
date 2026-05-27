import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Cable,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  DoorOpen,
  FileText,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react'

import { PortalShell } from '@/src/components/portal-shell'

export const metadata = {
  title: 'คู่มือติดตั้ง',
}

const guideSections = [
  {
    title: 'ก่อนเสนอราคา',
    icon: ClipboardCheck,
    items: [
      'ยืนยันประเภทหน้างาน เช่น โรงงาน ออฟฟิศ อาคารจอดรถ หรือพื้นที่กั้นคนเข้าออก',
      'เก็บจำนวนผู้ใช้งาน จุดเข้าออก และความต้องการเรื่อง report หรือ time attendance',
      'ขอรูปพื้นที่จริงทั้งมุมกว้างและจุดติดตั้ง เพื่อเทียบกับเคสตัวอย่าง',
    ],
  },
  {
    title: 'สำรวจหน้างาน',
    icon: Camera,
    items: [
      'ถ่ายรูปก่อนติดตั้งให้เห็นสภาพประตู ผนัง ฝ้า และทางเดินสาย',
      'ตรวจแหล่งจ่ายไฟ ระยะสาย LAN/Wi-Fi และตำแหน่งวาง controller',
      'จดข้อจำกัด เช่น ประตูกระจก พื้นที่เปียก ฝุ่น ความร้อน หรือพื้นที่นอกอาคาร',
    ],
  },
  {
    title: 'ติดตั้งและส่งมอบ',
    icon: Cable,
    items: [
      'ทดสอบสิทธิ์เข้าออกด้วย user ตัวอย่างก่อนส่งมอบ',
      'ถ่ายรูปหลังติดตั้งและรูป diagram เพื่ออัปโหลดเข้าคลังเคส',
      'แนบ PDF สรุปโครงการ drawing หรือ spec ที่ช่วยให้ทีมขายนำไปอ้างอิงต่อได้',
    ],
  },
]

const quickGuides = [
  {
    title: 'Access Control / Door Lock',
    href: '/search?q=Access%20Control',
    icon: DoorOpen,
    description: 'ใช้เทียบเคสประตูบานเดี่ยว ประตูกระจก และระบบควบคุมสิทธิ์เข้าออก',
  },
  {
    title: 'Flap Barrier / Gate',
    href: '/search?q=Flap%20Barrier',
    icon: ShieldCheck,
    description: 'ใช้กับพื้นที่ lobby ทางเข้าอาคาร หรือจุดคัดกรองคนเข้าออกจำนวนมาก',
  },
  {
    title: 'FAQ เชิงเทคนิค',
    href: '/faq',
    icon: HelpCircle,
    description: 'คำตอบสำเร็จรูปสำหรับข้อสงสัยที่ทีมขายเจอบ่อยระหว่างคุยกับลูกค้า',
  },
  {
    title: 'เอกสารประกอบ',
    href: '/documents',
    icon: FileText,
    description: 'รวม PDF, drawing, spec และเอกสารที่ผูกกับเคสที่เผยแพร่แล้ว',
  },
]

export default function GuidesPage() {
  return (
    <PortalShell>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                คู่มือติดตั้ง
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
                คู่มือและ checklist สำหรับคุยงานติดตั้ง
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                แนวทางรวบรวมข้อมูลหน้างานและสิ่งที่ควรถามลูกค้า ก่อนส่งต่อให้ทีมเทคนิคหรือเปิดเคสตัวอย่างประกอบการขาย
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {guideSections.map((section) => {
            const Icon = section.icon

            return (
              <article
                key={section.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {section.title}
                  </h2>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                ทางลัดสำหรับทีมขาย
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                เปิดข้อมูลประกอบการคุยกับลูกค้า
              </h2>
            </div>
            <Link
              href="/cases"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              ดูเคสทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickGuides.map((guide) => {
              const Icon = guide.icon

              return (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <Icon className="h-6 w-6 text-blue-700" />
                  <h3 className="mt-4 font-bold text-slate-950">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {guide.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-700">
                    เปิดดู
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </PortalShell>
  )
}
