'use client'

import { useState } from 'react'

import { PortalSidebar } from '@/src/components/portal-sidebar'
import { PortalTopbar, type PortalUser } from '@/src/components/portal-topbar'

type PortalShellProps = {
  children: React.ReactNode
  user?: PortalUser | null
}

export function PortalShell({ children, user }: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isAdmin = user?.role === 'admin' || user?.role === 'tech'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        <PortalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isAdmin={isAdmin}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />
        <div className="min-w-0 flex-1">
          <PortalTopbar
            onMenuClick={() => setSidebarOpen(true)}
            user={user}
          />
          <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
