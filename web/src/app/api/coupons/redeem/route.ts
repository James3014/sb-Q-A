import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

// 🎯 模組化：每個函數單一職責
async function validateAuth(req: NextRequest, supabase: any) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    console.warn('[Coupon] 用戶未提供認證 token')
    throw new Error('請先登入您的帳號，然後再使用折扣碼')
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) {
      console.warn('[Coupon] Token 驗證失敗:', error.message)
      throw new Error('登入已過期，請重新登入後再試')
    }
    if (!user) {
      console.warn('[Coupon] Token 有效但無用戶資料')
      throw new Error('帳號資料異常，請重新登入')
    }
    console.log(`[Coupon] 用戶認證成功: ${user.email}`)
    return user
  } catch (error) {
    console.error('[Coupon] 認證過程發生錯誤:', error)
    throw new Error('登入驗證失敗，請重新登入或聯繫客服')
  }
}

async function validateCoupon(supabase: any, code: string) {
  console.log(`[Coupon] 驗證折扣碼: ${code}`)
  
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    console.warn(`[Coupon] 折扣碼無效: ${code}`, error?.message)
    throw new Error(`折扣碼「${code}」無效，請檢查是否輸入正確`)
  }
  
  // 時間檢查
  const now = new Date()
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    console.warn(`[Coupon] 折扣碼已過期: ${code}, 過期時間: ${coupon.valid_until}`)
    throw new Error(`折扣碼「${code}」已於 ${new Date(coupon.valid_until).toLocaleDateString()} 過期`)
  }
  
  // 使用次數檢查
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    console.warn(`[Coupon] 折扣碼達使用上限: ${code}, 已用: ${coupon.used_count}/${coupon.max_uses}`)
    throw new Error(`折扣碼「${code}」已達使用上限，請聯繫客服或使用其他折扣碼`)
  }
  
  console.log(`[Coupon] 折扣碼驗證通過: ${code}, 剩餘次數: ${coupon.max_uses ? coupon.max_uses - coupon.used_count : '無限制'}`)
  return coupon
}

async function validateUser(supabase: any, userId: string) {
  console.log(`[Coupon] 檢查用戶資格: ${userId}`)
  
  const { data: user, error } = await supabase
    .from('users')
    .select('trial_used, subscription_expires_at, email')
    .eq('id', userId)
    .single()

  if (error) {
    console.error(`[Coupon] 用戶資料查詢失敗: ${userId}`, error)
    throw new Error('無法查詢用戶資料，請稍後再試或聯繫客服')
  }
  
  if (user?.trial_used) {
    console.warn(`[Coupon] 用戶已使用過試用: ${user.email}`)
    throw new Error('您已經使用過免費試用，每個帳號僅能使用一次。如需協助請聯繫客服')
  }
  
  // 檢查是否已有有效訂閱
  if (user?.subscription_expires_at) {
    const expiresAt = new Date(user.subscription_expires_at)
    if (expiresAt > new Date()) {
      console.warn(`[Coupon] 用戶已有有效訂閱: ${user.email}, 到期: ${expiresAt}`)
      throw new Error(`您已經是付費用戶（到期日：${expiresAt.toLocaleDateString()}），無需使用折扣碼`)
    }
  }
  
  console.log(`[Coupon] 用戶資格驗證通過: ${user.email}`)
  return user
}

async function checkDuplicateUsage(supabase: any, couponId: string, userId: string) {
  const { data } = await supabase
    .from('coupon_usages')
    .select('id, redeemed_at')
    .eq('coupon_id', couponId)
    .eq('user_id', userId)
    .single()

  if (data) {
    console.warn(`[Coupon] 用戶重複使用折扣碼: userId=${userId}, couponId=${couponId}, 首次使用: ${data.redeemed_at}`)
    throw new Error('您已經使用過這個折扣碼，每個折扣碼每人只能使用一次')
  }
}

async function redeemCoupon(supabase: any, coupon: any, userId: string, ip: string) {
  const now = new Date()
  
  // 根據 plan_id 計算到期時間
  let days = 7 // 預設 7 天
  switch (coupon.plan_id) {
    case 'pass_7':
      days = 7
      break
    case 'pass_30':
      days = 30
      break
    case 'pro_yearly':
      days = 365
      break
    default:
      console.warn(`[Coupon] 未知的 plan_id: ${coupon.plan_id}，使用預設 7 天`)
  }
  
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

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

  if (userError) {
    console.error('[Coupon] 用戶更新失敗:', userError)
    if (userError.message?.includes('subscription_type_check')) {
      throw new Error(`折扣碼方案「${coupon.plan_id}」無效，請聯繫客服處理`)
    }
    if (userError.message?.includes('violates check constraint')) {
      throw new Error(`資料驗證失敗：${userError.message}，請聯繫客服並提供此錯誤訊息`)
    }
    throw new Error(`訂閱啟用失敗：${userError.message}，請稍後再試或聯繫客服`)
  }

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
  const startTime = Date.now()
  let userId = 'unknown'
  let couponCode = 'unknown'
  
  try {
    // 1. 基本驗證
    const body = await req.json().catch(() => ({}))
    const code = body?.code?.trim()?.toUpperCase()
    couponCode = code || 'empty'
    
    if (!code) {
      console.warn('[Coupon] 空折扣碼請求')
      return NextResponse.json({ 
        ok: false, 
        error: '請輸入折扣碼。如果您沒有折扣碼，可以直接選擇付費方案' 
      }, { status: 400 })
    }

    // 2. 服務初始化
    const supabase = getSupabaseServiceRole()
    if (!supabase) {
      console.error('[Coupon] Supabase 服務未配置')
      return NextResponse.json({ 
        ok: false, 
        error: '服務暫時無法使用，請稍後再試或聯繫客服' 
      }, { status: 503 })
    }

    // 3. 模組化驗證（每步可獨立測試）
    const user = await validateAuth(req, supabase)
    userId = user.id
    const coupon = await validateCoupon(supabase, code)
    await validateUser(supabase, user.id)
    await checkDuplicateUsage(supabase, coupon.id, user.id)

    // 4. 執行兌換
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const result = await redeemCoupon(supabase, coupon, user.id, ip)

    // 5. 成功日誌
    const duration = Date.now() - startTime
    console.log(`[Coupon] 兌換成功: ${user.email} 使用 ${code}, 耗時: ${duration}ms`)

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
    const duration = Date.now() - startTime
    console.error(`[Coupon] 兌換失敗: userId=${userId}, code=${couponCode}, 錯誤=${error.message}, 耗時=${duration}ms`)
    
    // 根據錯誤類型返回不同狀態碼
    const isAuthError = error.message?.includes('登入')
    const status = isAuthError ? 401 : 400
    
    return NextResponse.json({ 
      ok: false, 
      error: error.message || '系統錯誤，請稍後再試或聯繫客服' 
    }, { status })
  }
}
