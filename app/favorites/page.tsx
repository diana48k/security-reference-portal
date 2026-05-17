import { Star } from 'lucide-react'

import { PortalPlaceholderPage } from '@/src/components/portal-placeholder-page'

export const metadata = {
  title: 'Favorites',
}

export default function FavoritesPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Favorites"
      title="รายการโปรดของฉัน"
      description="พื้นที่สำหรับเก็บเคสที่ทีมขายใช้บ่อย ในเฟสแรกยังเป็นหน้าเตรียมพร้อมก่อนเชื่อมระบบบันทึกรายการโปรดรายผู้ใช้"
      icon={Star}
    />
  )
}
