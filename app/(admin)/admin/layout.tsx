import { PortalShell } from '@/src/components/portal-shell'
import { getCurrentAdminUser } from '@/src/lib/queries/admin'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { profile, user } = await getCurrentAdminUser()

  return (
    <PortalShell
      user={{
        fullName: profile.full_name,
        email: user.email,
        role: profile.role,
      }}
    >
      {children}
    </PortalShell>
  )
}
