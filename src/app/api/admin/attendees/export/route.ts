import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/middleware-client'

async function requireAdmin() {
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Not authenticated.' }, { status: 401 }) }
  }

  const adminSupabase = createAdminClient()
  const { data: adminRow } = await adminSupabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!adminRow) {
    return { error: NextResponse.json({ error: 'Not authorized.' }, { status: 403 }) }
  }

  return { adminSupabase }
}

function escapeCsvField(field: string | null): string {
  if (field === null || field === undefined) return ''
  const str = String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { data, error } = await auth.adminSupabase
      .from('attendees')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('CSV export query failed:', error)
      return NextResponse.json({ error: 'Could not fetch attendees.' }, { status: 500 })
    }

    const headers = [
      'Full Name', 'Organization', 'Role', 'Email', 'Phone',
      'Dietary Needs', 'Accessibility Needs', 'Travel Needs', 'Consent Given', 'Registered At'
    ]

    const rows = data.map(a => [
      escapeCsvField(a.full_name),
      escapeCsvField(a.organization),
      escapeCsvField(a.role),
      escapeCsvField(a.email),
      escapeCsvField(a.phone),
      escapeCsvField(a.dietary_needs),
      escapeCsvField(a.accessibility_needs),
      escapeCsvField(a.travel_needs),
      a.consent_given ? 'Yes' : 'No',
      new Date(a.created_at).toISOString(),
    ].join(','))

    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="oak-attendees-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err) {
    console.error('Unexpected CSV export error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}