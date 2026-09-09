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

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { event_day, start_time, end_time, title, location, description, sort_order } = body

    if (!event_day || !start_time || !title) {
      return NextResponse.json(
        { error: 'event_day, start_time, and title are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await auth.adminSupabase
      .from('programme_sessions')
      .insert({
        event_day,
        start_time,
        end_time: end_time ?? null,
        title,
        location: location ?? null,
        description: description ?? null,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Programme session insert failed:', error)
      return NextResponse.json({ error: 'Could not create session.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected programme error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}