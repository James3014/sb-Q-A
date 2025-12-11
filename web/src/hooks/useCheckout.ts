'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'
import { trackEvent } from '@/lib/analytics'
import { SubscriptionPlanId } from '@/lib/constants'

export type CheckoutStatus = 'pending' | 'processing' | 'success' | 'error' | null

interface UseCheckoutOptions {
  user: User | null
  turnstileToken?: string | null
  enableTurnstile?: boolean
}

interface UseCheckoutReturn {
  checkoutPlan: SubscriptionPlanId | null
  modalStatus: CheckoutStatus
  modalMessage: string
  handleCheckout: (planId: SubscriptionPlanId) => Promise<void>
  handleCloseModal: () => void
}

/**
 * 支付流程 Hook
 *
 * 職責：
 * - 管理支付狀態（loading、error、success）
 * - 處理 Supabase 認證
 * - 呼叫支付 API
 * - 處理 Turnstile 驗證
 */
export function useCheckout({
  user,
  turnstileToken,
  enableTurnstile = false,
}: UseCheckoutOptions): UseCheckoutReturn {
  const router = useRouter()
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlanId | null>(null)
  const [modalStatus, setModalStatus] = useState<CheckoutStatus>(null)
  const [modalMessage, setModalMessage] = useState<string>('')

  const handleCheckout = async (planId: SubscriptionPlanId) => {
    // 未登入導向登入頁
    if (!user) {
      router.push('/login?redirect=/pricing')
      return
    }

    // Turnstile 驗證檢查
    if (enableTurnstile && !turnstileToken) {
      setModalStatus('error')
      setModalMessage('請完成驗證後再嘗試')
      return
    }

    setCheckoutPlan(planId)
    setModalStatus('pending')
    setModalMessage('準備建立訂單...')
    trackEvent('plan_selected', undefined, { plan: planId })

    try {
      const supabase = getSupabase()
      if (!supabase) {
        throw new Error('系統尚未設定 Supabase')
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.access_token) {
        throw new Error('無法取得認證 token，請重新登入')
      }

      setModalStatus('processing')
      setModalMessage('建立訂單中... 請稍候')

      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          ...(enableTurnstile && turnstileToken ? { 'x-turnstile-token': turnstileToken } : {}),
        },
        body: JSON.stringify({ planId, turnstileToken }),
        credentials: 'include',
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
        await new Promise(resolve => setTimeout(resolve, 1500))
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('訂單已建立，但缺少導向網址')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '建立訂單失敗'
      setModalStatus('error')
      setModalMessage(message)
      if (process.env.NODE_ENV === 'development') {
        console.error('[Checkout] Error:', error)
      }
    } finally {
      setCheckoutPlan(null)
    }
  }

  const handleCloseModal = () => {
    setModalStatus(null)
    setModalMessage('')
  }

  return {
    checkoutPlan,
    modalStatus,
    modalMessage,
    handleCheckout,
    handleCloseModal,
  }
}
