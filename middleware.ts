import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_GATE_COOKIE, ADMIN_GATE_MAX_AGE } from './src/lib/admin-gate'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // ── Admin area: verified on EVERY request, server-side ─────────────────────
  // Users must never see what is behind /admin — not the shell, not a flash of
  // it. Three things are required, otherwise → /admin/login:
  //   1. a valid Supabase session,
  //   2. membership of the `admins` table (checked via the service-role key),
  //   3. the short-lived gate cookie — the proof the admin logged in recently.
  //      It expires after 30 minutes without an admin page load, so returning
  //      to the portal always means signing in again.
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // The login page itself is the only open admin route. If a gated admin
    // lands on it, send them straight to the dashboard.
    if (pathname.startsWith('/admin/login')) {
      if (user && request.cookies.get(ADMIN_GATE_COOKIE)?.value) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return response
    }

    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)

    // 1. Must be signed in at all
    if (!user) {
      return NextResponse.redirect(loginUrl)
    }

    // 2. Must be a member of the admins table (bypasses RLS on purpose —
    //    this is a server-side check, the key never reaches the browser)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    const { data: adminRow } = await adminClient
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!adminRow) {
      return NextResponse.redirect(loginUrl)
    }

    // 3. Must have logged in recently (sliding 30-minute window)
    const gate = request.cookies.get(ADMIN_GATE_COOKIE)?.value
    if (!gate) {
      return NextResponse.redirect(loginUrl)
    }

    // All three passed — refresh the gate so active admins are not logged out
    response.cookies.set(ADMIN_GATE_COOKIE, Date.now().toString(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ADMIN_GATE_MAX_AGE,
    })
    return response
  }

  // ── Everywhere else: keep Supabase sessions fresh (existing behaviour) ─────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}