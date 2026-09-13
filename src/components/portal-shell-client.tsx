'use client'

import { useState } from 'react'

import { PortalSidebar, type PortalVisitorCounter } from '@/src/components/portal-sidebar'
import { PortalTopbar } from '@/src/components/portal-topbar'
import { AnalyticsTracker } from '@/src/components/analytics-tracker'
import type { PortalNotification, PortalUser } from '@/src/types/application'

type PortalShellClientProps = {
  children: React.ReactNode
  user?: PortalUser | null
  visitorCounter?: PortalVisitorCounter | null
  notifications?: PortalNotification[]
}

export function PortalShellClient({ children, user, visitorCounter, notifications = [] }: PortalShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isAdmin = user?.role === 'admin' || user?.role === 'tech'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AnalyticsTracker />
      <div className="flex min-h-screen">
        <PortalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isAdmin={isAdmin}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
          visitorCounter={visitorCounter}
        />
        <div className="min-w-0 flex-1">
          <PortalTopbar onMenuClick={() => setSidebarOpen(true)} user={user} notifications={notifications} />
          <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
