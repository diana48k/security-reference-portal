export const USER_ROLES = ['viewer', 'sales', 'tech', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

export type PortalUser = {
  id: string
  fullName?: string | null
  email?: string | null
  role?: UserRole | null
}

export type ManagedUser = {
  id: string
  email: string
  fullName: string | null
  role: UserRole
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
  updatedAt: string
  lastSignInAt: string | null
}

export const NOTIFICATION_EVENT_TYPES = [
  'case_published',
  'case_updated',
  'document_updated',
  'faq_updated',
] as const
export type NotificationEventType = (typeof NOTIFICATION_EVENT_TYPES)[number]

export type PortalNotification = {
  id: string
  eventType: NotificationEventType
  title: string
  message: string | null
  href: string
  createdAt: string
  readAt: string | null
}

export const ANALYTICS_EVENT_NAMES = [
  'page_view',
  'document_download',
  'presentation_export',
  'search',
  'favorite_toggle',
  'feedback_submit',
] as const
export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number]

export type AnalyticsDateRange = {
  start: string
  end: string
  days: number
}

export type AnalyticsTrendPoint = {
  date: string
  visitors: number
  sessions: number
  pageViews: number
  downloads: number
}

export type AnalyticsRankingItem = {
  key: string
  label: string
  value: number
}

export type AnalyticsUserActivity = {
  userId: string
  fullName: string | null
  email: string | null
  sessions: number
  pageViews: number
  downloads: number
  lastActivityAt: string | null
}

export type AdminDashboardMetrics = {
  configured: boolean
  range: AnalyticsDateRange
  visitors: number
  visitorsToday: number
  sessions: number
  pageViews: number
  pagesPerSession: number
  downloads: number
  presentationExports: number
  activeUsers: number
  returningVisitorRate: number
  averageSessionMinutes: number
  trend: AnalyticsTrendPoint[]
  topPages: AnalyticsRankingItem[]
  topCases: AnalyticsRankingItem[]
  topDocuments: AnalyticsRankingItem[]
  topSearches: AnalyticsRankingItem[]
  searches: number
  noResultRate: number
  favoriteToggles: number
  usefulFeedbackRate: number
  userActivity: AnalyticsUserActivity[]
}
