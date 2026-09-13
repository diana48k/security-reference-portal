import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(12, 'รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร')
  .regex(/[a-z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก')
  .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่')
  .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลข')
  .regex(/[^A-Za-z0-9]/, 'รหัสผ่านต้องมีอักขระพิเศษ')

export function getSafeNextPath(value: FormDataEntryValue | string | null | undefined) {
  const path = typeof value === 'string' ? value : ''

  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return '/admin'
  }

  return path
}

export function canRemovePrivilegedTarget({ targetRole, targetActive, activePrivilegedCount }: { targetRole: string; targetActive: boolean; activePrivilegedCount: number }) {
  return !(targetActive && ['admin', 'tech'].includes(targetRole) && activePrivilegedCount <= 1)
}
