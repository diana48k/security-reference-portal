import { Users } from 'lucide-react'

import { PortalPlaceholderPage } from '@/src/components/portal-placeholder-page'

export const metadata = {
  title: 'จัดการผู้ใช้',
}

export default function AdminUsersPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="ผู้ดูแลระบบ"
      title="จัดการผู้ใช้"
      description="พื้นที่สำหรับจัดการผู้ใช้และสิทธิ์ในอนาคต ปัจจุบันสิทธิ์ admin/tech ยังอ้างอิงจากตาราง profiles เดิม"
      icon={Users}
      withShell={false}
      actions={[
        { href: '/admin', label: 'แดชบอร์ดผู้ดูแล' },
        { href: '/admin/cases', label: 'จัดการเคส' },
      ]}
    />
  )
}
