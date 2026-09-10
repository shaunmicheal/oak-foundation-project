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
    const formData = await request.formData()

    const name = formData.get('name') as string | null
    const website_url = formData.get('website_url') as string | null
    const parent_partner_id = formData.get('parent_partner_id') as string | null
    const sort_order = formData.get('sort_order') as string | null
    const logoFile = formData.get('logo') as File | null

    if (!name) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 })
    }

    let logo_url: string | null = null

    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await auth.adminSupabase.storage
        .from('partner-logos')
        .upload(fileName, logoFile, {
          contentType: logoFile.type,
        })

      if (uploadError) {
        console.error('Logo upload failed:', uploadError)
        return NextResponse.json({ error: 'Logo upload failed.' }, { status: 500 })
      }

      const { data: publicUrlData } = auth.adminSupabase.storage
        .from('partner-logos')
        .getPublicUrl(fileName)

      logo_url = publicUrlData.publicUrl
    }

    const { data, error } = await auth.adminSupabase
      .from('partners')
      .insert({
        name,
        logo_url,
        website_url: website_url || null,
        parent_partner_id: parent_partner_id || null,
        sort_order: sort_order ? parseInt(sort_order) : 0,
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