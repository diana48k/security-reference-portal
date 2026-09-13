'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { getSafeNextPath, passwordSchema } from '@/src/lib/auth-utils'
import { getRequiredActiveUser } from '@/src/lib/queries/auth'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { getSiteUrlOrThrow } from '@/src/lib/supabase/config'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export type AuthActionState = {
  error?: string
  success?: string
}

const loginSchema = z.object({
  email: z.string().trim().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
  next: z.string().optional(),
})

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' }
  }

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_active, must_change_password')
    .eq('id', data.user.id)
    .maybeSingle()

  const profile = profileData as {
    is_active: boolean
    must_change_password: boolean
  } | null

  if (!profile?.is_active) {
    await supabase.auth.signOut({ scope: 'local' })
    return { error: 'บัญชีนี้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ' }
  }

  if (profile.must_change_password) {
    redirect('/account/change-password?required=1')
  }

  redirect(getSafeNextPath(parsed.data.next))
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut({ scope: 'local' })
  redirect('/login')
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = z.string().trim().email().safeParse(formData.get('email'))

  if (!parsed.success) {
    return { error: 'กรุณากรอกอีเมลให้ถูกต้อง' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${getSiteUrlOrThrow()}/auth/callback?next=${encodeURIComponent('/account/change-password?recovery=1')}`,
    })
  } catch {
    return { error: 'ไม่สามารถส่งอีเมลได้ในขณะนี้ กรุณาลองใหม่ภายหลัง' }
  }

  return {
    success: 'หากอีเมลนี้มีบัญชีอยู่ ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้',
  }
}

export async function changePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const currentPassword = String(formData.get('currentPassword') ?? '')
  const parsed = passwordSchema.safeParse(password)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'รหัสผ่านไม่ถูกต้อง' }
  }

  if (password !== confirmPassword) {
    return { error: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' }
  }

  const { profile, supabase, user } = await getRequiredActiveUser()
  const cookieStore = await cookies()
  const isRecovery = cookieStore.get('portal_password_recovery')?.value === '1'
  if (!profile.must_change_password && !isRecovery && !currentPassword) {
    return { error: 'กรุณายืนยันรหัสผ่านปัจจุบัน' }
  }
  const attributes = currentPassword
    ? { password, current_password: currentPassword }
    : { password }
  const { error } = await supabase.auth.updateUser(attributes)

  if (error) {
    return { error: error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้' }
  }

  const admin = createSupabaseAdminClient()
  const { error: profileError } = await admin
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', user.id)

  if (profileError) {
    return { error: 'เปลี่ยนรหัสผ่านแล้ว แต่ไม่สามารถอัปเดตสถานะบัญชีได้' }
  }

  cookieStore.delete('portal_password_recovery')

  redirect(profile.role === 'admin' || profile.role === 'tech' ? '/admin' : '/')
}
