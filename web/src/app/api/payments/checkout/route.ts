import { NextRequest, NextResponse } from 'next/server'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { createCheckoutSession } from '@/lib/payments'
import { recordPurchaseEvent } from '@/lib/analyticsServer'
import { verifyTurnstile } from '@/lib/botDefense'

interface CheckoutBody {
  planId?: string
  turnstileToken?: string
}

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
  const userId = userResult.user.id
  const userEmail = userResult.user.email ?? null

  const body = (await req.json().catch(() => null)) as CheckoutBody | null
  if (!body?.planId) {
    return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
  }

  // 機器人防護（可選）
  const turnstileHeader = req.headers.get('x-turnstile-token')
  const turnstileToken = turnstileHeader || body.turnstileToken || null
  const turnstileOk = await verifyTurnstile(turnstileToken)
  if (!turnstileOk) {
    return NextResponse.json({ error: 'Turnstile verification failed' }, { status: 400 })
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === body.planId)
  if (!plan) {
    return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
  }

  const { data: userProfile, error: userProfileError } = await supabase
    .from('users')
    .select('subscription_type, subscription_expires_at')
    .eq('id', userId)
    .single()

  if (userProfileError) {
    console.error('[Checkout] Failed to fetch user profile', userProfileError.message)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }

  const now = new Date()
  const existingPlan = userProfile?.subscription_type
  const expiry = userProfile?.subscription_expires_at
  const hasActiveSubscription =
    existingPlan && existingPlan !== 'free' && expiry ? new Date(expiry) > now : false

  if (hasActiveSubscription) {
    return NextResponse.json(
      {
        error: 'Subscription already active',
        detail: '目前已有有效方案，請確認是否需要續訂或更換方案',
      },
      { status: 409 }
    )
  }

  const currency = 'TWD'
  const provider = process.env.PAYMENT_PROVIDER || 'mock'

  const { data: paymentRow, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      plan_id: plan.id,
      amount: plan.price,
      currency,
      provider,
      status: 'pending',
      metadata: {
        user_email: userEmail,
        previous_plan: existingPlan || 'free',
      },
    })
    .select('id')
    .single()

  if (paymentError || !paymentRow) {
    console.error('[Checkout] Failed to insert payment', paymentError?.message)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }

  try {
    const session = await createCheckoutSession({
      paymentId: paymentRow.id,
      planId: plan.id,
      amount: plan.price,
      currency,
      userId,
      userEmail,
      origin: req.headers.get('origin'),
    })

    await supabase
      .from('payments')
      .update({
        provider_payment_id: session.providerPaymentId,
        metadata: {
          user_email: userEmail,
          previous_plan: existingPlan || 'free',
          checkout_payload: session.payload || null,
        },
      })
      .eq('id', paymentRow.id)

    const eventMetadata = {
      plan_id: plan.id,
      amount: plan.price,
      currency,
      payment_id: paymentRow.id,
      provider,
    }
    await recordPurchaseEvent(supabase, userId, 'purchase_initiated', eventMetadata)

    return NextResponse.json({
      ok: true,
      paymentId: paymentRow.id,
      providerPaymentId: session.providerPaymentId,
      checkoutUrl: session.checkoutUrl,
      amount: plan.price,
      currency,
      plan: {
        id: plan.id,
        label: plan.label,
        days: plan.days,
      },
    })
  } catch (err) {
    console.error('[Checkout] Failed to create checkout session', err)
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'Unknown error',
      })
      .eq('id', paymentRow.id)

    return NextResponse.json({ ok: false, error: 'Payment provider error' }, { status: 502 })
  }
}
