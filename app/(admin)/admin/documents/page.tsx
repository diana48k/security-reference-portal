import { Files } from 'lucide-react'

import { PortalPlaceholderPage } from '@/src/components/portal-placeholder-page'

export const metadata = {
  title: 'จัดการเอกสาร',
}

export default function AdminDocumentsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="ผู้ดูแลระบบ"
      title="จัดการเอกสาร"
      description="พื้นที่สำหรับจัดการเอกสารส่วนกลางของระบบ ในเฟสนี้เอกสารที่ผูกกับเคสยังอัปโหลดได้จากหน้าแก้ไขเคสเดิม"
      icon={Files}
      withShell={false}
      actions={[
        { href: '/admin/cases', label: 'จัดการเคส' },
        { href: '/documents', label: 'ดูหน้าเอกสาร' },
      ]}
    />
  )
}
