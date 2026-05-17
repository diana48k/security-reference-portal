import { BookOpen } from 'lucide-react'

import { PortalPlaceholderPage } from '@/src/components/portal-placeholder-page'

export const metadata = {
  title: 'คู่มือติดตั้ง',
}

export default function GuidesPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="คู่มือติดตั้ง"
      title="คู่มือและแนวทางติดตั้ง"
      description="พื้นที่สำหรับรวม installation guide, checklist หน้างาน, wiring note และแนวทางตอบคำถามเชิงเทคนิคให้ทีมขายใช้อ้างอิง"
      icon={BookOpen}
    />
  )
}
