import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from './supabaseServer'
import { isAdminUser } from './adminAuth'

export async function authorizeAdmin(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return { error: NextResponse.json({ error: 'Service not configured' }, { status: 500 }) }
  }

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return { error: NextResponse.json({ error: 'Missing token' }, { status: 401 }) }
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userResult?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const callerId = userResult.user.id

  // 角色檢查（metadata/環境變數）
  if (isAdminUser(userResult.user)) {
    return { supabase, user: userResult.user }
  }

  // 後端欄位檢查（資料表 is_admin）
  const { data: caller } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', callerId)
    .single()

  if (!caller?.is_admin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, user: userResult.user }
}
