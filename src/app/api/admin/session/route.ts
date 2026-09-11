import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/middleware-client'
import { ADMIN_GATE_COOKIE, ADMIN_GATE_MAX_AGE } from '@/lib/admin-gate'

const GATE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

/**
 * POST /api/admin/session — mints the short-lived admin gate cookie.
 * Called by the login page right after a successful Supabase sign-in.
 * Rejects authenticated users who are not in the `admins` table.
 */
export async function POST() {
  try {
    const authClient = await createServerSupabaseClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    const { data: adminRow } = await adminSupabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminRow) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(ADMIN_GATE_COOKIE, Date.now().toString(), {
      ...GATE_COOKIE_OPTIONS,
      maxAge: ADMIN_GATE_MAX_AGE,
    })
    return response
  } catch (err) {
    console.error('Admin session mint failed:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/session — clears the gate. Called on sign-out so the
 * portal is immediately locked again.
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_GATE_COOKIE, '', {
    ...GATE_COOKIE_OPTIONS,
    maxAge: 0,
  })
  return response
}
