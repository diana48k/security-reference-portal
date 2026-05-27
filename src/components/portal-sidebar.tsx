'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  Download,
  FileQuestion,
  Files,
  FolderKanban,
  HelpCircle,
  Home,
  LayoutDashboard,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  UploadCloud,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'

import { BrandLogo } from '@/src/components/brand-logo'

type PortalSidebarProps = {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  isAdmin?: boolean
}

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  match?: string[]
  badge?: string
}

const primaryNav: NavItem[] = [
  { href: '/', label: 'หน้าหลัก', icon: Home, match: ['/'] },
  { href: '/search', label: 'ค้นหางานติดตั้ง', icon: Search, match: ['/search'] },
  { href: '/categories', label: 'หมวดระบบ', icon: Tags, match: ['/categories'] },
  {
    href: '/cases',
    label: 'เคสโครงการ',
    icon: BriefcaseBusiness,
    match: ['/cases'],
  },
  { href: '/guides', label: 'คู่มือติดตั้ง', icon: BookOpen },
  { href: '/faq', label: 'FAQ / คำถามที่พบบ่อย', icon: HelpCircle },
  { href: '/documents', label: 'เอกสาร / ดาวน์โหลด', icon: Files },
  { href: '/news', label: 'ข่าวสาร / อัปเดต', icon: Newspaper },
]

const workspaceNav: NavItem[] = [
  { href: '/favorites', label: 'รายการโปรดของฉัน', icon: Star },
  { href: '/recent', label: 'ดูล่าสุด', icon: Clock3 },
]

const adminNav: NavItem[] = [
  { href: '/admin', label: 'แดชบอร์ดผู้ดูแล', icon: LayoutDashboard, match: ['/admin'] },
  { href: '/admin/cases', label: 'จัดการเคส', icon: FolderKanban },
  { href: '/admin/cases/new', label: 'เพิ่มเคสใหม่', icon: UploadCloud },
  { href: '/admin/taxonomy', label: 'จัดการหมวดระบบ', icon: Tags },
  { href: '/admin/faqs', label: 'จัดการ FAQ', icon: FileQuestion },
  { href: '/admin/documents', label: 'จัดการเอกสาร', icon: Files },
  { href: '/admin/users', label: 'จัดการผู้ใช้', icon: Users },
]

function isActive(pathname: string, item: NavItem) {
  if (item.href === '/') return pathname === '/'
  if (item.href === '/admin') return pathname === '/admin'

  if (item.match?.some((match) => match === pathname)) return true

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavLink({
  item,
  pathname,
  onClose,
  isCollapsed,
}: {
  item: NavItem
  pathname: string
  onClose: () => void
  isCollapsed: boolean
}) {
  const active = isActive(pathname, item)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClose}
      title={isCollapsed ? item.label : undefined}
      className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/25'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className={`min-w-0 flex-1 truncate ${isCollapsed ? 'lg:hidden' : ''}`}>
        {item.label}
      </span>
      {item.badge && !isCollapsed ? (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
          }`}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

export function PortalSidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  isAdmin,
}: PortalSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 transition lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-slate-950 text-white shadow-2xl transition-all lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'}`}
      >
        <div
          className={`flex items-start justify-between gap-3 px-5 py-5 ${
            isCollapsed ? 'lg:flex-col lg:items-center lg:px-4' : ''
          }`}
        >
          <div className={isCollapsed ? 'lg:[&>div>div:last-child]:hidden' : ''}>
            <BrandLogo tone="light" />
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:inline-flex"
            aria-label={isCollapsed ? 'แสดงเมนูด้านข้าง' : 'ซ่อนเมนูด้านข้าง'}
            title={isCollapsed ? 'แสดงเมนู' : 'ซ่อนเมนู'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-5 pb-5">
          <div className="space-y-2">
            {primaryNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                onClose={onClose}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className={`mb-3 px-2 text-xs font-bold uppercase tracking-wide text-slate-400 ${isCollapsed ? 'lg:hidden' : ''}`}>
              รายการโปรด
            </div>
            <div className="space-y-2">
              {workspaceNav.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onClose={onClose}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>

          {isAdmin ? (
            <div className="border-t border-white/10 pt-5">
              <div className={`mb-3 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-400 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <Settings className="h-4 w-4" />
                ผู้ดูแลระบบ
              </div>
              <div className="space-y-2">
                {adminNav.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onClose={onClose}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        <div className={`space-y-4 border-t border-white/10 p-5 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold">ส่งเคสให้ลูกค้าได้ง่าย ๆ</h3>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              สร้างลิงก์หรือ PDF เพื่อส่งให้ลูกค้าดูประกอบการตัดสินใจ
            </p>
            <Link
              href="/guides"
              onClick={onClose}
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/15 text-xs font-bold text-white transition hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              วิธีการใช้งาน
            </Link>
          </div>

        </div>
      </aside>
    </>
  )
}
