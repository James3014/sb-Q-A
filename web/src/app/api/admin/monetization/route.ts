import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function GET(req: NextRequest) {
  const { supabase, error } = await authorizeAdmin(req)
  if (error) return error

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
