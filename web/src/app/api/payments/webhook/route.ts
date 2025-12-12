import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'
import { getSettlementPeriod } from '@/lib/affiliate/commission'
import {
  buildRawPayload,
  mapStatus,
  shouldSkipStatusUpdate,
  updateUserForStatus,
  validatePaymentPayload,
  logPaymentEvent,
} from '@/lib/payments/webhookUtils'
import { PaymentStatus } from '@/lib/payments/types'
import { parseWebhookPayload, getProviderName } from '@/lib/payments/providers'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET
  const signature = req.headers.get('x-webhook-signature')
  const rawBodyText = webhookSecret ? await req.text() : null

  let rawBody: Record<string, unknown> | null = null
  try {
    rawBody = (rawBodyText ? JSON.parse(rawBodyText || '{}') : await req.json()) as Record<string, unknown> | null
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (webhookSecret) {
    if (!signature || !rawBodyText) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    const expected = createHmac('sha256', webhookSecret).update(rawBodyText).digest('hex')
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  if (!rawBody) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // 使用策略模式解析 webhook（自動判斷供應商）
  const webhookPayload = parseWebhookPayload(rawBody)
  const provider = getProviderName(rawBody)

  if (!webhookPayload) {
    return NextResponse.json({ error: 'Failed to parse webhook' }, { status: 400 })
  }

  const providerPaymentId = webhookPayload.providerPaymentId
  const paymentId = webhookPayload.paymentId
  if (!providerPaymentId && !paymentId) {
    return NextResponse.json({ error: 'Missing payment identifiers' }, { status: 400 })
  }

  const mappedStatus: PaymentStatus = mapStatus(webhookPayload.status)

  let query = supabase.from('payments').select('*').limit(1)

  if (providerPaymentId) {
    query = query.eq('provider_payment_id', providerPaymentId)
  } else if (paymentId) {
    query = query.eq('id', paymentId)
  }

  const { data: paymentRecords, error: paymentLookupError } = await query

  if (paymentLookupError || !paymentRecords || paymentRecords.length === 0) {
    console.error('[Webhook] Payment not found', paymentLookupError?.message)
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const payment = paymentRecords[0]
  const planId = webhookPayload.planId || payment.plan_id
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)

  if (!plan) {
    console.error('[Webhook] Plan not found for payment', planId)
    return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
  }

  const validationError = validatePaymentPayload(webhookPayload, payment)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  const rawPayload = buildRawPayload(webhookPayload, provider)

  if (shouldSkipStatusUpdate(payment.status, mappedStatus)) {
    await supabase
      .from('payments')
      .update({
        raw_payload: rawPayload,
        error_message:
          mappedStatus === 'failed' ? webhookPayload.reason || null : payment.error_message,
      })
      .eq('id', payment.id)
    return NextResponse.json({ ok: true, detail: 'Payment already processed' })
  }

  const paymentUpdate: Record<string, unknown> = {
    raw_payload: rawPayload,
    error_message: mappedStatus === 'failed' ? webhookPayload.reason || null : null,
  }

  if (mappedStatus !== payment.status) {
    paymentUpdate.status = mappedStatus
  }
  if (!payment.provider_payment_id && providerPaymentId) {
    paymentUpdate.provider_payment_id = providerPaymentId
  }

  await supabase.from('payments').update(paymentUpdate).eq('id', payment.id)

  const metadata = {
    plan_id: plan.id,
    amount: payment.amount,
    currency: payment.currency,
    payment_id: payment.id,
    provider,
    provider_payment_id: payment.provider_payment_id,
    status: mappedStatus,
    reason: webhookPayload.reason,
  }

  const eventType =
    mappedStatus === 'active'
      ? 'purchase_success'
      : mappedStatus === 'refunded'
        ? 'purchase_refunded'
        : 'purchase_failed'

  if (payment.status !== mappedStatus) {
    await logPaymentEvent(supabase, payment.user_id, eventType, metadata)
  }

  const referenceId = providerPaymentId || payment.provider_payment_id

  if (mappedStatus === 'active' && payment.status !== 'active') {
    await updateUserForStatus(
      supabase,
      payment.user_id,
      plan.id,
      mappedStatus,
      referenceId,
      provider
    )

    // 11.1 檢測試用轉付費並記錄分潤
    const { data: user } = await supabase
      .from('users')
      .select('trial_used, trial_source')
      .eq('id', payment.user_id)
      .single()

    if (user?.trial_used && user?.trial_source) {
      console.log(`[Webhook] 檢測到試用轉付費: ${user.trial_source}`)
      
      // 查找合作方
      const { data: coupon } = await supabase
        .from('coupons')
        .select('partner_id')
        .eq('code', user.trial_source)
        .single()

      if (coupon?.partner_id) {
        // 獲取合作方分潤率
        const { data: partner } = await supabase
          .from('affiliate_partners')
          .select('commission_rate')
          .eq('id', coupon.partner_id)
          .single()

        if (partner) {
          const commissionAmount = Math.round(payment.amount * partner.commission_rate * 100) / 100
          const quarter = getSettlementPeriod()

          // 插入分潤記錄
          const { error: commissionError } = await supabase
            .from('affiliate_commissions')
            .insert({
              partner_id: coupon.partner_id,
              payment_id: payment.id,
              user_id: payment.user_id,
              coupon_code: user.trial_source,
              trial_amount: 0,
              paid_amount: payment.amount,
              commission_rate: partner.commission_rate,
              commission_amount: commissionAmount,
              settlement_quarter: quarter,
              status: 'pending'
            })

          if (commissionError) {
            console.error('[Webhook] 分潤記錄失敗:', commissionError)
          } else {
            console.log(`[Webhook] 分潤記錄成功: ${user.trial_source} -> NT$${commissionAmount}`)
          }
        }
      }
    }
  } else if (mappedStatus === 'refunded' || mappedStatus === 'failed' || mappedStatus === 'canceled') {
    await updateUserForStatus(
      supabase,
      payment.user_id,
      plan.id,
      mappedStatus,
      referenceId,
      provider
    )
  }

  return NextResponse.json({ ok: true })
}
