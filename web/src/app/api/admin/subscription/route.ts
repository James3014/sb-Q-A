import { NextRequest, NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { authorizeAdmin } from '@/lib/adminGuard'

export async function POST(req: NextRequest) {
  const { supabase, error: authError } = await authorizeAdmin(req)
  if (authError) return authError

  const body = await req.json().catch(() => null) as { userId?: string; planId?: string } | null
  if (!body?.userId || !body?.planId) {
    return NextResponse.json({ error: 'Missing userId or planId' }, { status: 400 })
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === body.planId)
  if (!plan) {
    return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString()

  const { error: updateError } = await supabase
    .from('users')
    .update({
      subscription_type: plan.id,
      subscription_expires_at: expiresAt,
    })
    .eq('id', body.userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, expiresAt, plan: plan.id })
}

