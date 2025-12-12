import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

function authorizeCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const provided =
    req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  return provided === secret
}

export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Service not configured' }, { status: 500 })
  }

  const nowIso = new Date().toISOString()
  const { data: targets, error } = await supabase
    .from('users')
    .select('id, subscription_type, trial_source')
    .eq('trial_used', true)
    .neq('subscription_type', 'free')
    .lt('subscription_expires_at', nowIso)

  if (error) {
    console.error('[Cron] failed to list expired trials', error.message)
    return NextResponse.json({ ok: false, error: 'Query failed' }, { status: 500 })
  }

  if (!targets || targets.length === 0) {
    return NextResponse.json({ ok: true, expired: 0 })
  }

  const ids = targets.map((user) => user.id)
  const { error: updateError } = await supabase
    .from('users')
    .update({
      subscription_type: 'free',
      subscription_expires_at: null,
      payment_status: 'none',
      last_payment_provider: null,
      last_payment_reference: null,
    })
    .in('id', ids)

  if (updateError) {
    console.error('[Cron] failed to downgrade users', updateError.message)
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 })
  }

  try {
    await supabase.from('event_log').insert(
      targets.map((user) => ({
        user_id: user.id,
        event_type: 'trial_expired',
        metadata: {
          previous_plan: user.subscription_type,
          trial_source: user.trial_source,
        },
      }))
    )
  } catch (err) {
    console.error('[Cron] failed to log trial expiry events', err)
  }

  return NextResponse.json({ ok: true, expired: targets.length })
}
