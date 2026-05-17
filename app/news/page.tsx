import { Newspaper } from 'lucide-react'

import { PortalPlaceholderPage } from '@/src/components/portal-placeholder-page'

export const metadata = {
  title: 'News',
}

export default function NewsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="News"
      title="ข่าวสาร / อัปเดต"
      description="พื้นที่สำหรับประกาศระบบใหม่ อุปกรณ์ใหม่ โปรโมชั่นภายใน หรือ note จากทีมเทคนิคที่ทีมขายควรรู้"
      icon={Newspaper}
    />
  )
}
