'use client'
import { PageContainer } from '@/components/ui';

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { CheckoutModal } from '@/components/CheckoutModal'
import { trackEvent } from '@/lib/analytics'
import { getSupabase } from '@/lib/supabase'
import { SubscriptionPlanId } from '@/lib/constants'

function PlanCard({ 
  plan, 
  price, 
  label, 
  features, 
  highlight,
  badge,
  onSelect,
  loading,
  disabled,
}: { 
  plan: string
  price: string
  label?: string
  features: string[]
  highlight?: boolean
  badge?: string
  onSelect?: () => void
  loading?: boolean
  disabled?: boolean
}) {
  const clickable = !!onSelect
  return (
    <div 
      onClick={disabled ? undefined : onSelect}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={`rounded-lg p-4 mb-4 transition-all ${
        highlight 
          ? 'bg-gradient-to-b from-amber-900/50 to-zinc-800 border border-amber-600/50' 
          : 'bg-zinc-800'
      } ${clickable ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{
        cursor: clickable ? (disabled ? 'not-allowed' : 'pointer') : 'default',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold ${highlight ? 'text-amber-400' : ''}`}>{label || plan}</h3>
        {badge && <span className="text-xs bg-amber-600 px-2 py-0.5 rounded">{badge}</span>}
      </div>
      <p className="text-2xl font-bold mb-3">{loading ? '建立訂單中...' : price}</p>
      <ul className="text-sm space-y-1">
        {features.map((f, i) => (
          <li key={i} className={highlight ? 'text-amber-200' : 'text-zinc-300'}>{f}</li>
        ))}
      </ul>
    </div>
  )
}

export default function PricingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlanId | null>(null)
  const [modalStatus, setModalStatus] = useState<'pending' | 'processing' | 'success' | 'error' | null>(null)
  const [modalMessage, setModalMessage] = useState<string>('')

  useEffect(() => {
    trackEvent('pricing_view')
  }, [])

  const handleCheckout = async (planId: SubscriptionPlanId) => {
    if (!user) {
      router.push('/login?redirect=/pricing')
      return
    }

    setCheckoutPlan(planId)
    setModalStatus('pending')
    setModalMessage('準備建立訂單...')
    trackEvent('plan_selected', undefined, { plan: planId })

    try {
      // 直接使用 Supabase client 取得當前 session
      const supabase = getSupabase()
      if (!supabase) {
        throw new Error('系統尚未設定 Supabase')
      }

      // 取得當前使用者的 session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error('無法取得認證 token，請重新登入')
      }

      // 更新模態窗口狀態
      setModalStatus('processing')
      setModalMessage('建立訂單中... 請稍候')

      // 呼叫 API 並傳遞 Bearer token
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId }),
        credentials: 'include', // 帶著 cookie/auth 信息
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const detail = body.detail || body.error || res.statusText
        throw new Error(detail || '建立訂單失敗')
      }

      const data = await res.json()
      if (data.checkoutUrl) {
        setModalStatus('success')
        setModalMessage('訂單建立成功！即將跳轉到支付頁面...')
        // 添加短暫延遲以確保 UI 更新
        await new Promise(resolve => setTimeout(resolve, 1500))
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('訂單已建立，但缺少導向網址')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '建立訂單失敗'
      setModalStatus('error')
      setModalMessage(message)
      console.error('[Checkout] Error:', error)
    } finally {
      setCheckoutPlan(null)
    }
  }

  const handleCloseModal = () => {
    setModalStatus(null)
    setModalMessage('')
  }

  return (
    <PageContainer>
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400">←</Link>
            <h1 className="text-xl font-bold">方案與價格</h1>
          </div>
          <div className="text-sm">
            {loading ? (
              <span className="text-zinc-500">載入中...</span>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-zinc-300">{user.email}</span>
              </div>
            ) : (
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                登入
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        
        <PlanCard 
          plan="free"
          price="$0"
          label="免費版"
          features={[
            '✓ 28 堂初級課程',
            '✓ 搜尋 / 篩選',
            '✓ 試閱中級課程（僅問題區塊）',
          ]}
        />

        {/* 短期 PASS */}
        <div className="bg-gradient-to-b from-blue-900/50 to-zinc-800 rounded-lg p-4 mb-4 border border-blue-600/50">
          <h3 className="font-bold mb-2 text-blue-400">短期 PASS</h3>
          <p className="text-zinc-400 text-sm mb-3">適合短期雪旅</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleCheckout('pass_7')}
              disabled={checkoutPlan !== null || !user}
              className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed rounded-lg p-3 text-center transition-all font-semibold text-white disabled:opacity-60 active:scale-95"
            >
              <p className="text-lg font-bold">
                {checkoutPlan === 'pass_7' ? '建立中...' : '$180'}
              </p>
              <p className="text-xs opacity-90">7 天方案</p>
            </button>
            <button
              onClick={() => handleCheckout('pass_30')}
              disabled={checkoutPlan !== null || !user}
              className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-zinc-600 disabled:to-zinc-600 disabled:cursor-not-allowed rounded-lg p-3 text-center transition-all font-semibold text-white disabled:opacity-60 active:scale-95"
            >
              <p className="text-lg font-bold">
                {checkoutPlan === 'pass_30' ? '建立中...' : '$290'}
              </p>
              <p className="text-xs opacity-90">30 天方案</p>
            </button>
          </div>
          
          <ul className="text-sm space-y-1">
            <li>✓ 全部 213 堂課程</li>
            <li>✓ 收藏功能</li>
            <li>✓ 練習紀錄 / 自評 / 趨勢</li>
          </ul>
        </div>

        <PlanCard 
          plan="year"
          price="$690/年"
          label="PRO 年費"
          badge="最划算"
          highlight
          features={[
            '✓ 全部課程（213+）',
            '✓ 雪季更新內容',
            '✓ 收藏功能',
            '✓ 練習紀錄 + 改善曲線',
            '✓ 課程組合推薦（未來）',
          ]}
          onSelect={() => handleCheckout('pro_yearly')}
          loading={checkoutPlan === 'pro_yearly'}
          disabled={!user}
        />

        {/* 開通說明 */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">📝 如何購買</h3>
          <ol className="text-sm text-zinc-300 space-y-2">
            <li>1. 登入帳號（Email：<span className="text-amber-400">{user?.email || '請先登入'}</span>）</li>
            <li>2. 點選方案按鈕</li>
            <li>3. 前往安全支付頁面完成付款</li>
            <li>4. 付款成功後立即開通</li>
          </ol>
          <p className="text-zinc-500 text-xs mt-3">支援信用卡、行動支付等多種付款方式</p>
        </div>

        {/* 支付進度模態視窗 */}
        <CheckoutModal
          isOpen={modalStatus !== null}
          status={modalStatus || 'pending'}
          message={modalMessage}
          onClose={handleCloseModal}
        />

        {!user && (
          <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-500 text-center py-3 rounded-lg font-medium mb-6">
            請先登入
          </Link>
        )}

        {/* FAQ */}
        <div className="mt-8">
          <h3 className="font-bold mb-3">常見問題</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-zinc-300">Q: 付款後多久開通？</p>
              <p className="text-zinc-500">A: 付款成功後立即開通，可馬上使用所有功能</p>
            </div>
            <div>
              <p className="text-zinc-300">Q: PASS 到期後怎麼辦？</p>
              <p className="text-zinc-500">A: 可隨時續購或升級年費方案，不會遺失練習紀錄</p>
            </div>
            <div>
              <p className="text-zinc-300">Q: 會有新課程嗎？</p>
              <p className="text-zinc-500">A: 會持續更新課程內容，PRO 年費用戶可免費使用所有新增課程</p>
            </div>
            <div>
              <p className="text-zinc-300">Q: 可以退款嗎？</p>
              <p className="text-zinc-500">A: 如有問題請聯繫客服，我們會協助處理</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
