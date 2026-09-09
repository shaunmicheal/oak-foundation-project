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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    let query = auth.adminSupabase
      .from('attendees')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,organization.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error('Attendee list query failed:', error)
      return NextResponse.json({ error: 'Could not fetch attendees.' }, { status: 500 })
    }

    return NextResponse.json({ attendees: data })
  } catch (err) {
    console.error('Unexpected attendee list error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}