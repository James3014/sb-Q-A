import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userResult?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const callerId = userResult.user.id
  const { data: caller } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', callerId)
    .single()

  if (!caller?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase.rpc('get_all_users')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}
