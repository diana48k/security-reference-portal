import { Files } from 'lucide-react'

import { PortalPlaceholderPage } from '@/src/components/portal-placeholder-page'

export const metadata = {
  title: 'เอกสาร',
}

export default function DocumentsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="เอกสาร"
      title="เอกสาร / ดาวน์โหลด"
      description="พื้นที่สำหรับรวม PDF, brochure, spec sheet, template ใบเสนอราคา และเอกสารประกอบการขายที่ใช้ซ้ำบ่อย"
      icon={Files}
    />
  )
}
