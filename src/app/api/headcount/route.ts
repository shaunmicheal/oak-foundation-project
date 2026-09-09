import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/middleware-client'

export async function GET(request: NextRequest) {
  try {
    // 1. Confirm the caller is a logged-in admin
    const authClient = await createServerSupabaseClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()

    const { data: adminRow } = await adminSupabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!adminRow) {
      return NextResponse.json(
        { error: 'Not authorized.' },
        { status: 403 }
      )
    }

    // 2. Get the day from the query string, e.g. /api/headcount?day=2026-11-09
    const searchParams = request.nextUrl.searchParams
    const day = searchParams.get('day')

    if (!day) {
      return NextResponse.json(
        { error: 'day query parameter is required, e.g. ?day=2026-11-09' },
        { status: 400 }
      )
    }

    // 3. Count check-ins for that day
    const { count, error } = await adminSupabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('event_day', day)

    if (error) {
      console.error('Headcount query failed:', error)
      return NextResponse.json(
        { error: 'Could not fetch headcount.' },
        { status: 500 }
      )
    }

    // 4. Get total registered attendees too, for context (e.g. "42 of 110")
    const { count: totalRegistered, error: totalError } = await adminSupabase
      .from('attendees')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Total attendee count failed:', totalError)
    }

    return NextResponse.json({
      day,
      checked_in: count ?? 0,
      total_registered: totalRegistered ?? 0,
    })
  } catch (err) {
    console.error('Unexpected headcount error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}