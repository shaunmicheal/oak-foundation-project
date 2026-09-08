import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('attendees')
    .select('full_name, organization, qr_token')
    .eq('qr_token', token)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Attendee not found.' },
      { status: 404 }
    )
  }

  // Only these three fields ever leave the server — no email, phone,
  // dietary/accessibility/travel data on this public-facing endpoint.
  return NextResponse.json(data)
}