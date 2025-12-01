import { NextRequest, NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
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

  const body = await req.json().catch(() => null) as { userId?: string; planId?: string } | null
  if (!body?.userId || !body?.planId) {
    return NextResponse.json({ error: 'Missing userId or planId' }, { status: 400 })
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === body.planId)
  if (!plan) {
    return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('users')
    .update({
      subscription_type: plan.id,
      subscription_expires_at: expiresAt,
    })
    .eq('id', body.userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, expiresAt, plan: plan.id })
}
