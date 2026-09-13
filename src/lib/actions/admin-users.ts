'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentAdminUser } from '@/src/lib/queries/admin'
import { canRemovePrivilegedTarget } from '@/src/lib/auth-utils'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { USER_ROLES, type UserRole } from '@/src/types/application'

export type UserAdminActionState = { error?: string; success?: string; temporaryPassword?: string }

const actionSchema = z.object({ intent: z.enum(['create', 'update', 'reset_password', 'suspend', 'restore', 'delete']), id: z.string().uuid().optional(), email: z.string().trim().email().optional(), fullName: z.string().trim().min(1).max(120).optional(), role: z.enum(USER_ROLES).optional(), confirmation: z.string().trim().optional() })
const createTemporaryPassword = () => `Tg!${randomBytes(18).toString('base64url')}9aA`

export async function manageUserAction(_state: UserAdminActionState, formData: FormData): Promise<UserAdminActionState> {
  const parsed = actionSchema.safeParse({ intent: formData.get('intent'), id: formData.get('id') || undefined, email: formData.get('email') || undefined, fullName: formData.get('fullName') || undefined, role: formData.get('role') || undefined, confirmation: formData.get('confirmation') || undefined })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }
  const { user: actor } = await getCurrentAdminUser()
  const admin = createSupabaseAdminClient()
  const input = parsed.data

  try {
    if (input.intent === 'create') {
      if (!input.email || !input.fullName || !input.role) return { error: 'กรุณากรอกชื่อ อีเมล และสิทธิ์ให้ครบ' }
      const temporaryPassword = createTemporaryPassword()
      const { data, error } = await admin.auth.admin.createUser({ email: input.email, password: temporaryPassword, email_confirm: true, app_metadata: { role: input.role, must_change_password: true }, user_metadata: { full_name: input.fullName } })
      if (error) throw error
      await admin.from('profiles').upsert({ id: data.user.id, full_name: input.fullName, role: input.role, is_active: true, must_change_password: true, updated_at: new Date().toISOString() })
      await writeAudit(admin, actor.id, data.user.id, 'create', null, { email: input.email, full_name: input.fullName, role: input.role })
      revalidatePath('/admin/users')
      return { success: 'สร้างผู้ใช้แล้ว โปรดคัดลอกรหัสชั่วคราวก่อนปิดข้อความนี้', temporaryPassword }
    }

    if (!input.id) return { error: 'ไม่พบผู้ใช้เป้าหมาย' }
    const { data: authResult, error: authError } = await admin.auth.admin.getUserById(input.id)
    if (authError || !authResult.user) throw authError ?? new Error('ไม่พบผู้ใช้')
    const { data: profileData, error: profileError } = await admin.from('profiles').select('id, full_name, role, is_active').eq('id', input.id).single()
    if (profileError) throw profileError
    const profile = profileData as { id: string; full_name: string | null; role: UserRole; is_active: boolean }
    if (['suspend', 'delete'].includes(input.intent) && actor.id === input.id) return { error: 'ไม่สามารถระงับหรือลบบัญชีที่กำลังใช้งานอยู่' }
    const removesPrivilege = ['suspend', 'delete'].includes(input.intent) || (input.intent === 'update' && input.role && !['admin', 'tech'].includes(input.role))
    if (removesPrivilege && !canRemovePrivilegedTarget({ targetRole: profile.role, targetActive: profile.is_active, activePrivilegedCount: await countActivePrivileged(admin) })) return { error: 'ต้องมีผู้ดูแลระบบหรือทีมเทคนิคที่ใช้งานได้อย่างน้อย 1 บัญชี' }

    if (input.intent === 'update') {
      if (!input.email || !input.fullName || !input.role) return { error: 'กรุณากรอกชื่อ อีเมล และสิทธิ์ให้ครบ' }
      const before = { email: authResult.user.email, full_name: profile.full_name, role: profile.role }
      const { error } = await admin.auth.admin.updateUserById(input.id, { email: input.email, email_confirm: true, user_metadata: { ...authResult.user.user_metadata, full_name: input.fullName }, app_metadata: { ...authResult.user.app_metadata, role: input.role } })
      if (error) throw error
      const { error: updateError } = await admin.from('profiles').update({ full_name: input.fullName, role: input.role, updated_at: new Date().toISOString() }).eq('id', input.id)
      if (updateError) throw updateError
      await writeAudit(admin, actor.id, input.id, profile.role === input.role ? 'update' : 'role_change', before, { email: input.email, full_name: input.fullName, role: input.role })
      revalidatePath('/admin/users')
      return { success: 'บันทึกข้อมูลผู้ใช้แล้ว' }
    }
    if (input.intent === 'reset_password') {
      const temporaryPassword = createTemporaryPassword()
      const { error } = await admin.auth.admin.updateUserById(input.id, { password: temporaryPassword, app_metadata: { ...authResult.user.app_metadata, must_change_password: true } })
      if (error) throw error
      await admin.from('profiles').update({ must_change_password: true, updated_at: new Date().toISOString() }).eq('id', input.id)
      await writeAudit(admin, actor.id, input.id, 'password_reset', null, { forced_change: true })
      revalidatePath('/admin/users')
      return { success: 'สร้างรหัสผ่านชั่วคราวใหม่แล้ว', temporaryPassword }
    }
    if (input.intent === 'suspend' || input.intent === 'restore') {
      const restoring = input.intent === 'restore'
      const { error } = await admin.auth.admin.updateUserById(input.id, { ban_duration: restoring ? 'none' : '876600h' })
      if (error) throw error
      await admin.from('profiles').update({ is_active: restoring, updated_at: new Date().toISOString() }).eq('id', input.id)
      await writeAudit(admin, actor.id, input.id, input.intent, { is_active: !restoring }, { is_active: restoring })
      revalidatePath('/admin/users')
      return { success: restoring ? 'คืนสถานะผู้ใช้แล้ว' : 'ระงับผู้ใช้แล้ว' }
    }
    if (input.confirmation?.toLowerCase() !== (authResult.user.email ?? '').toLowerCase()) return { error: 'กรุณาพิมพ์อีเมลของผู้ใช้ให้ตรงกันก่อนลบถาวร' }
    const deletedSnapshot = { email: authResult.user.email, full_name: profile.full_name, role: profile.role }
    const { error } = await admin.auth.admin.deleteUser(input.id, false)
    if (error) throw error
    await writeAudit(admin, actor.id, input.id, 'delete', deletedSnapshot, null)
    revalidatePath('/admin/users')
    return { success: 'ลบผู้ใช้ถาวรแล้ว' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'ไม่สามารถดำเนินการได้' }
  }
}

async function countActivePrivileged(admin: ReturnType<typeof createSupabaseAdminClient>) {
  const { count, error } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true).in('role', ['admin', 'tech'])
  if (error) throw error
  return count ?? 0
}

async function writeAudit(admin: ReturnType<typeof createSupabaseAdminClient>, actorId: string, targetId: string, action: string, before: unknown, after: unknown) {
  const { error } = await admin.from('user_admin_audit_logs').insert({ actor_id: actorId, target_user_id: targetId, action, before_data: before, after_data: after })
  if (error) throw error
}
