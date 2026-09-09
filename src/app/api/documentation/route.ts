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

    const event_day = formData.get('event_day') as string | null
    const notes = formData.get('notes') as string | null
    const photos = formData.getAll('photos') as File[]

    if (!event_day) {
      return NextResponse.json({ error: 'event_day is required.' }, { status: 400 })
    }

    const photo_urls: string[] = []

    for (const photo of photos) {
      if (!photo || photo.size === 0) continue

      const fileExt = photo.name.split('.').pop()
      const fileName = `${event_day}/${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await auth.adminSupabase.storage
        .from('event-photos')
        .upload(fileName, photo, { contentType: photo.type })

      if (uploadError) {
        console.error('Photo upload failed:', uploadError)
        continue
      }

      const { data: publicUrlData } = auth.adminSupabase.storage
        .from('event-photos')
        .getPublicUrl(fileName)

      photo_urls.push(publicUrlData.publicUrl)
    }

    const { data, error } = await auth.adminSupabase
      .from('documentation_posts')
      .insert({
        event_day,
        notes: notes || null,
        photo_urls,
      })
      .select()
      .single()

    if (error) {
      console.error('Documentation post insert failed:', error)
      return NextResponse.json({ error: 'Could not create post.' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Unexpected documentation error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}