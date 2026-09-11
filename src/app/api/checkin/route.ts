import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/middleware-client'

export async function POST(request: NextRequest) {
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

    // 2. Parse the scanned token + day
    const body = await request.json()
    const { qr_token, event_day } = body

    if (!qr_token || !event_day) {
      return NextResponse.json(
        { error: 'qr_token and event_day are required.' },
        { status: 400 }
      )
    }

    // 3. Look up the attendee by their QR token
    const { data: attendee, error: attendeeError } = await adminSupabase
      .from('attendees')
      .select('id, full_name, organization, role')
      .eq('qr_token', qr_token)
      .single()

    if (attendeeError || !attendee) {
      return NextResponse.json(
        { error: 'QR code not recognized.' },
        { status: 404 }
      )
    }

    // 4. Record the check-in — the unique(attendee_id, event_day)
    //    constraint blocks a second scan on the same day
    const { error: checkinError } = await adminSupabase
      .from('check_ins')
      .insert({
        attendee_id: attendee.id,
        event_day,
        checked_in_by: user.id,
      })

    if (checkinError) {
      // Postgres unique violation code = 23505
      if (checkinError.code === '23505') {
        return NextResponse.json(
          {
            error: 'Already checked in today.',
            full_name: attendee.full_name,
            organization: attendee.organization,
            role: attendee.role,
          },
          { status: 409 }
        )
      }
      console.error('Check-in insert failed:', checkinError)
      return NextResponse.json(
        { error: 'Check-in failed. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        full_name: attendee.full_name,
        organization: attendee.organization,
        role: attendee.role,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Unexpected check-in error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}