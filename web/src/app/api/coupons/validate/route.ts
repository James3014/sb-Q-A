import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'
import { validateCoupon } from '@/lib/coupons/validation'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServiceRole()
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Service not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const code = typeof body?.code === 'string' ? body.code : ''
  if (!code) {
    return NextResponse.json({ ok: false, error: '缺少折扣碼' }, { status: 400 })
  }

  let userId: string | undefined
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (token) {
    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data?.user) {
      userId = data.user.id
    }
  }

  const context = await validateCoupon({ supabase, code, userId })
  const status = context.result.reason === 'server_error' ? 500 : 200
  return NextResponse.json(context.result, { status })
}
