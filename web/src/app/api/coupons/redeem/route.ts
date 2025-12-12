import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

// 🎯 模組化：每個函數單一職責
async function validateAuth(req: NextRequest, supabase: any) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) throw new Error('請先登入')
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) throw new Error('登入已過期')
    return user
  } catch (error) {
    throw new Error('登入驗證失敗')
  }
}

async function validateCoupon(supabase: any, code: string) {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error || !coupon) throw new Error('折扣碼無效')
  
  // 時間檢查
  const now = new Date()
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    throw new Error('折扣碼已過期')
  }
  
  // 使用次數檢查
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    throw new Error('折扣碼已達使用上限')
  }
  
  return coupon
}

async function validateUser(supabase: any, userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('trial_used, subscription_expires_at')
    .eq('id', userId)
    .single()

  if (error) throw new Error('用戶資料錯誤')
  if (user?.trial_used) throw new Error('您已使用過試用')
  
  return user
}

async function checkDuplicateUsage(supabase: any, couponId: string, userId: string) {
  const { data } = await supabase
    .from('coupon_usages')
    .select('id')
    .eq('coupon_id', couponId)
    .eq('user_id', userId)
    .single()

  if (data) throw new Error('您已使用過此折扣碼')
}

async function redeemCoupon(supabase: any, coupon: any, userId: string, ip: string) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // 原子操作：更新用戶
  const { error: userError } = await supabase
    .from('users')
    .update({
      subscription_type: coupon.plan_id,
      subscription_expires_at: expiresAt.toISOString(),
      trial_used: true,
      trial_activated_at: now.toISOString()
    })
    .eq('id', userId)

  if (userError) throw userError

  // 記錄使用
  await supabase.from('coupon_usages').insert({
    coupon_id: coupon.id,
    user_id: userId,
    redeemed_at: now.toISOString(),
    ip_address: ip
  })

  // 更新使用次數
  await supabase
    .from('coupons')
    .update({ used_count: (coupon.used_count || 0) + 1 })
    .eq('id', coupon.id)

  return { expiresAt, activatedAt: now }
}

// 🎯 主函數：關注點分離
export async function POST(req: NextRequest) {
  try {
    // 1. 基本驗證
    const body = await req.json().catch(() => ({}))
    const code = body?.code?.trim()?.toUpperCase()
    if (!code) {
      return NextResponse.json({ ok: false, error: '請輸入折扣碼' }, { status: 400 })
    }

    // 2. 服務初始化
    const supabase = getSupabaseServiceRole()
    if (!supabase) {
      return NextResponse.json({ ok: false, error: '服務暫時無法使用' }, { status: 503 })
    }

    // 3. 模組化驗證（每步可獨立測試）
    const user = await validateAuth(req, supabase)
    const coupon = await validateCoupon(supabase, code)
    await validateUser(supabase, user.id)
    await checkDuplicateUsage(supabase, coupon.id, user.id)

    // 4. 執行兌換
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const result = await redeemCoupon(supabase, coupon, user.id, ip)

    // 5. 成功回應
    return NextResponse.json({
      ok: true,
      subscription: {
        plan: coupon.plan_id,
        plan_label: coupon.plan_label || coupon.plan_id,
        expires_at: result.expiresAt.toISOString(),
        trial_activated_at: result.activatedAt.toISOString()
      }
    })

  } catch (error: any) {
    console.error('Coupon redeem error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error.message || '系統錯誤' 
    }, { status: error.message?.includes('登入') ? 401 : 400 })
  }
}
