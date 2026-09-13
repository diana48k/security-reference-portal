import { PortalShellClient } from '@/src/components/portal-shell-client'
import type { PortalVisitorCounter } from '@/src/components/portal-sidebar'
import { getOptionalPortalUser } from '@/src/lib/queries/auth'
import { getRecentNotifications } from '@/src/lib/queries/notifications'
import type { PortalUser } from '@/src/types/application'

type PortalShellProps = {
  children: React.ReactNode
  user?: PortalUser | null
  visitorCounter?: PortalVisitorCounter | null
}

export async function PortalShell({ children, user, visitorCounter }: PortalShellProps) {
  const resolvedUser = user === undefined ? await getOptionalPortalUser() : user
  const notifications = resolvedUser ? await getRecentNotifications(resolvedUser.id) : []

  return (
    <PortalShellClient user={resolvedUser} visitorCounter={visitorCounter} notifications={notifications}>
      {children}
    </PortalShellClient>
  )
}
