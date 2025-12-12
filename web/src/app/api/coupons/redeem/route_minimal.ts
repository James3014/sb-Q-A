import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceRole } from '@/lib/supabaseServer'

// 🎯 單一職責：只處理折扣碼兌換
export async function POST(req: NextRequest) {
  try {
    // 1. 基本驗證
    const body = await req.json().catch(() => ({}))
    const code = body?.code?.trim()?.toUpperCase()
    
    if (!code) {
      return NextResponse.json({ 
        ok: false, 
        error: '請輸入折扣碼' 
      }, { status: 400 })
    }

    // 2. 認證檢查
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ 
        ok: false, 
        error: '請先登入' 
      }, { status: 401 })
    }

    // 3. 資料庫連線
    const supabase = getSupabaseServiceRole()
    if (!supabase) {
      return NextResponse.json({ 
        ok: false, 
        error: '服務暫時無法使用' 
      }, { status: 503 })
    }

    // 4. 用戶驗證
    const { data: user, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user?.user) {
      return NextResponse.json({ 
        ok: false, 
        error: '登入已過期' 
      }, { status: 401 })
    }

    // 5. 檢查折扣碼（最簡化）
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (!coupon) {
      return NextResponse.json({ 
        ok: false, 
        error: '折扣碼無效' 
      }, { status: 400 })
    }

    // 6. 檢查用戶狀態
    const { data: userData } = await supabase
      .from('users')
      .select('trial_used, subscription_expires_at')
      .eq('id', user.user.id)
      .single()

    if (userData?.trial_used) {
      return NextResponse.json({ 
        ok: false, 
        error: '您已使用過試用' 
      }, { status: 400 })
    }

    // 7. 執行兌換（原子操作）
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        subscription_type: coupon.plan_id,
        subscription_expires_at: expiresAt.toISOString(),
        trial_used: true,
        trial_activated_at: now.toISOString()
      })
      .eq('id', user.user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ 
        ok: false, 
        error: '兌換失敗，請稍後再試' 
      }, { status: 500 })
    }

    // 8. 成功回應
    return NextResponse.json({
      ok: true,
      subscription: {
        plan: coupon.plan_id,
        expires_at: expiresAt.toISOString(),
        trial_activated_at: now.toISOString()
      }
    })

  } catch (error) {
    console.error('Coupon redeem error:', error)
    return NextResponse.json({ 
      ok: false, 
      error: '系統錯誤' 
    }, { status: 500 })
  }
}
