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
    const { name, logo_url, website_url, parent_partner_id, sort_order } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 })
    }

    const { data, error } = await auth.adminSupabase
      .from('partners')
      .insert({
        name,
        logo_url: logo_url ?? null,
        website_url: website_url ?? null,
        parent_partner_id: parent_partner_id ?? null,
        sort_order: sort_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Partner insert failed:', error)
      return NextResponse.json({ error: 'Could not create partner.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected partner error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}