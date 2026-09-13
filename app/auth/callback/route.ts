import { NextRequest, NextResponse } from 'next/server'

import { getSafeNextPath } from '@/src/lib/auth-utils'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = getSafeNextPath(request.nextUrl.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid-link', request.url))
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/login?error=invalid-link', request.url))
  }

  const response = NextResponse.redirect(new URL(next, request.url))
  if (next.startsWith('/account/change-password')) {
    response.cookies.set('portal_password_recovery', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/account/change-password',
      maxAge: 600,
    })
  }
  return response
}
