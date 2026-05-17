import { Clock3 } from 'lucide-react'

import { PortalPlaceholderPage } from '@/src/components/portal-placeholder-page'

export const metadata = {
  title: 'Recent',
}

export default function RecentPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Recent"
      title="ดูล่าสุด"
      description="พื้นที่สำหรับแสดงเคสที่เพิ่งเปิดดู ในเฟสแรกยังเป็นหน้าเตรียมพร้อมก่อนเชื่อมประวัติการใช้งานจริง"
      icon={Clock3}
    />
  )
}
