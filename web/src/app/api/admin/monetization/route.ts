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

  const [subs, funnel, daily, users] = await Promise.all([
    supabase.rpc('get_subscription_stats'),
    supabase.rpc('get_funnel_stats', { p_days: 30 }),
    supabase.rpc('get_daily_subscriptions', { p_days: 30 }),
    supabase.from('users').select('id', { count: 'exact' }),
  ])

  if (subs.error) return NextResponse.json({ error: subs.error.message }, { status: 500 })
  if (funnel.error) return NextResponse.json({ error: funnel.error.message }, { status: 500 })
  if (daily.error) return NextResponse.json({ error: daily.error.message }, { status: 500 })
  if (users.error) return NextResponse.json({ error: users.error.message }, { status: 500 })

  return NextResponse.json({
    subscriptions: subs.data || [],
    funnel: funnel.data?.[0] || { pricing_views: 0, plan_clicks: 0, purchases: 0 },
    dailySubs: daily.data || [],
    totalUsers: users.count || 0,
  })
}
