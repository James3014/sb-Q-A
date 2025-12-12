'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageContainer } from '@/components/ui'
import { useAuth } from '@/components/AuthProvider'
import { CheckoutModal } from '@/components/CheckoutModal'
import { TurnstileWidget } from '@/components/TurnstileWidget'
import { CouponBanner } from '@/components/CouponBanner'
import { useCheckout } from '@/hooks/useCheckout'
import { trackEvent } from '@/lib/analytics'
import { SubscriptionPlanId } from '@/lib/constants'
import { getSupabase } from '@/lib/supabase'
import { CouponValidationResult, CouponRedeemResult } from '@/types/coupon'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const couponParam = searchParams.get('coupon')?.trim() || ''
  const { user, loading, refreshSubscription } = useAuth()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const enableTurnstile = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null)
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [redeemingTrial, setRedeemingTrial] = useState(false)

  const {
    checkoutPlan,
    modalStatus,
    modalMessage,
    handleCheckout,
    handleCloseModal,
  } = useCheckout({ user, turnstileToken, enableTurnstile })

  const fetchAccessToken = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) throw new Error('Supabase 未設定')
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw error
    }
    return data.session?.access_token || null
  }, [])

  useEffect(() => {
    if (!couponParam) {
      setCouponResult(null)
      setCouponStatus('idle')
      setCouponMessage(null)
      return
    }

    let cancelled = false
    const validate = async () => {
      setCouponStatus('loading')
      setCouponMessage('驗證折扣碼中...')
      const token = user ? await fetchAccessToken().catch(() => null) : null

      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ code: couponParam }),
        })
        const data: CouponValidationResult = await res.json()
        if (cancelled) return
        if (data.ok && data.coupon) {
          setCouponResult(data)
          setCouponStatus('ready')
          setCouponMessage(`已套用 ${data.coupon.plan_label}`)
        } else {
          setCouponResult(null)
          setCouponStatus('error')
          setCouponMessage(data.error || '折扣碼無法使用')
        }
      } catch (err) {
        if (cancelled) return
        setCouponResult(null)
        setCouponStatus('error')
        setCouponMessage(err instanceof Error ? err.message : '折扣碼驗證失敗')
      }
    }

    validate()
    return () => {
      cancelled = true
    }
  }, [couponParam, user?.id, fetchAccessToken])

  const handleRedeemTrial = useCallback(async () => {
    if (!couponResult?.coupon) return
    if (!user) {
      const redirectTarget = couponParam ? `/pricing?coupon=${encodeURIComponent(couponParam)}` : '/pricing'
      router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`)
      return
    }

    try {
      setRedeemingTrial(true)
      setCouponStatus('loading')
      setCouponMessage('啟用試用中...')
      const token = await fetchAccessToken()
      if (!token) {
        throw new Error('無法取得登入資訊，請重新登入')
      }

      const res = await fetch('/api/coupons/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponResult.coupon.code }),
      })
      const data: CouponRedeemResult = await res.json()
      if (!res.ok || !data.ok || !data.subscription) {
        throw new Error(data.error || '啟用失敗')
      }

      setCouponStatus('ready')
      setCouponMessage('免費試用已啟用！')
      await refreshSubscription().catch(() => {})

      const params = new URLSearchParams()
      if (data.subscription.plan_label) params.set('plan', data.subscription.plan_label)
      if (data.subscription.expires_at) params.set('expires', data.subscription.expires_at)
      router.push(`/trial-success?${params.toString()}`)
    } catch (err) {
      setCouponStatus('error')
      setCouponMessage(err instanceof Error ? err.message : '啟用失敗')
    } finally {
      setRedeemingTrial(false)
    }
  }, [couponResult, user, couponParam, router, fetchAccessToken, refreshSubscription])

  useEffect(() => {
    trackEvent('pricing_view')
  }, [])

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
        {enableTurnstile && (
          <div className="mb-4">
            <p className="text-sm text-zinc-400 mb-2">為防止機器人濫用，請完成驗證：</p>
            <TurnstileWidget onToken={setTurnstileToken} />
          </div>
        )}

        {couponResult?.coupon && (
          <div className="mb-4">
            <CouponBanner
              coupon={couponResult.coupon}
              loading={couponStatus === 'loading' || redeemingTrial}
              disabled={redeemingTrial}
              statusMessage={couponMessage || undefined}
              statusVariant={couponStatus === 'error' ? 'error' : 'success'}
              onRedeem={handleRedeemTrial}
            />
          </div>
        )}

        {couponParam && !couponResult?.coupon && couponStatus === 'error' && couponMessage && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/40 px-3 py-2 text-sm text-red-100">
            {couponMessage}
          </div>
        )}

        <PlanCard
          plan="free"
          price="$0"
          label="免費版"
          features={[
            '✓ 28 堂初級課程（完整內容）',
            '✓ 搜尋 / 篩選功能',
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

          <ul className="text-sm space-y-1 text-zinc-300">
            <li>✓ 全部 213 堂課程</li>
            <li>✓ 收藏功能</li>
            <li>✓ 練習紀錄 / 自評</li>
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
            '✓ 練習紀錄 / 自評',
            '✓ 深度練習分析（進步曲線、頻率統計）',
            '✓ 個人化學習建議',
          ]}
          onSelect={() => handleCheckout('pro_yearly')}
          loading={checkoutPlan === 'pro_yearly'}
          disabled={!user}
        />

        {/* 開通說明 */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">📝 如何購買</h3>
          <ol className="text-sm text-zinc-300 space-y-2">
            <li>1. {user ? '已登入' : '請先登入'}</li>
            <li>2. 點選方案按鈕</li>
            <li>3. 前往安全支付頁面完成付款</li>
            <li>4. 付款成功後立即開通</li>
          </ol>
          <p className="text-zinc-500 text-xs mt-3">支援信用卡付款</p>
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
