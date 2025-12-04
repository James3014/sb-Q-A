import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  // 取得 payment ID 從 URL query
  const url = new URL(req.url)
  const paymentId = url.searchParams.get('id')

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
  }

  // 驗證用戶身份
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

  // 查詢 payment 記錄（RLS 會確保只能查看自己的）
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select(
      `
      id,
      status,
      plan_id,
      amount,
      currency,
      provider,
      provider_payment_id,
      error_message,
      created_at,
      updated_at,
      metadata
      `
    )
    .eq('id', paymentId)
    .eq('user_id', userId)
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: payment.id,
    status: payment.status,
    planId: payment.plan_id,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    providerPaymentId: payment.provider_payment_id,
    errorMessage: payment.error_message,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at,
    metadata: payment.metadata,
  })
}
