import Link from 'next/link'
import { FolderKanban, HelpCircle, LayoutDashboard, Tags } from 'lucide-react'

import { BrandLogo } from '@/src/components/brand-logo'
import { LogoutButton } from '@/src/components/logout-button'
import { getCurrentAdminUser } from '@/src/lib/queries/admin'

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/cases',
    label: 'Cases',
    icon: FolderKanban,
  },
  {
    href: '/admin/taxonomy',
    label: 'Taxonomy',
    icon: Tags,
  },
  {
    href: '/admin/faqs',
    label: 'FAQs',
    icon: HelpCircle,
  },
]

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { profile, user } = await getCurrentAdminUser()

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/admin">
              <BrandLogo />
            </Link>
            <p className="mt-1 text-sm text-slate-600">
              {profile.full_name ?? user.email} - {profile.role}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</div>
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
        © Tigersoft Installation Reference Portal. Admin workspace.
      </footer>
    </main>
  )
}
