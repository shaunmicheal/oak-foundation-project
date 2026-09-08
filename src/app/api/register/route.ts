import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      full_name,
      organization,
      role,
      email,
      phone,
      dietary_needs,
      accessibility_needs,
      travel_needs,
      consent_given,
    } = body

    // Basic validation — reject before touching the database
    if (!full_name || !organization || !email) {
      return NextResponse.json(
        { error: 'Full name, organization, and email are required.' },
        { status: 400 }
      )
    }

    if (!consent_given) {
      return NextResponse.json(
        { error: 'Consent is required to register.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('attendees')
      .insert({
        full_name,
        organization,
        role: role ?? null,
        email,
        phone: phone ?? null,
        dietary_needs: dietary_needs ?? null,
        accessibility_needs: accessibility_needs ?? null,
        travel_needs: travel_needs ?? null,
        consent_given,
      })
      .select('qr_token, full_name')
      .single()

    if (error) {
      console.error('Registration insert failed:', error)
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      )
    }

    // Only qr_token + full_name go back to the browser — nothing else.
    return NextResponse.json(
      { qr_token: data.qr_token, full_name: data.full_name },
      { status: 201 }
    )
  } catch (err) {
    console.error('Unexpected registration error:', err)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}