'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const paymentId = searchParams.get('payment_id')

  useEffect(() => {
    if (!paymentId) {
      setStatus('error')
      setMessage('缺少支付 ID')
      return
    }

    // 輪詢查詢支付狀態
    const checkPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('supabase.auth.token')
        if (!token) {
          setStatus('error')
          setMessage('未登入，請重新登入')
          return
        }

        const response = await fetch(`/api/payments/status?id=${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch payment status')
        }

        const data = await response.json()

        if (data.status === 'active') {
          setStatus('success')
          setMessage('支付成功！訂閱已啟動。')
          // 3 秒後導向首頁
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else if (data.status === 'failed' || data.status === 'canceled') {
          setStatus('error')
          setMessage(data.errorMessage || '支付失敗，請重試')
        } else if (data.status === 'pending') {
          // 繼續等待
          setTimeout(checkPaymentStatus, 2000)
        }
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : '檢查狀態失敗')
      }
    }

    checkPaymentStatus()
  }, [paymentId, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">處理中</h1>
            <p className="text-gray-600">正在確認支付狀態...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">支付成功！</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              返回首頁
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✕</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">支付失敗</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-4">
              <Link
                href="/pricing"
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                重試
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                返回
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">載入中...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
