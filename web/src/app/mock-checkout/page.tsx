'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageContainer } from '@/components/ui'

function MockCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get('payment_id')
  const planLabel = searchParams.get('plan')
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'mock'

  if (provider !== 'mock') {
    return (
      <PageContainer className="flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-800 rounded-xl p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold">Mock Checkout 已停用</h1>
          <p className="text-zinc-400 text-sm">已啟用正式金流供應商，無法使用模擬付款。</p>
          <Link href="/" className="underline text-amber-300">
            返回首頁
          </Link>
        </div>
      </PageContainer>
    )
  }

  const simulatePayment = async () => {
    if (!paymentId) {
      setMessage('找不到 payment_id, 請返回方案頁')
      return
    }
    setStatus('processing')
    setMessage(null)

    const res = await fetch('/api/payments/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentId,
        providerPaymentId: `mock_${paymentId}`,
        status: 'success',
        payload: { simulated: true },
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setStatus('error')
      setMessage(body.error || res.statusText)
      return
    }
    setStatus('done')
    setMessage('付款已模擬成功！您可以返回首頁或重新整理查看訂閱狀態。')
  }

  return (
    <PageContainer className="flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-800 rounded-xl p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Mock Checkout</h1>
        <p className="text-zinc-400 text-sm">
          目前使用 mock 金流，請點擊下方按鈕模擬付款成功。
        </p>
        <div className="bg-zinc-900 rounded-lg p-4 text-left text-sm text-zinc-300 space-y-1">
          <p>Payment ID：<span className="text-amber-300">{paymentId || '未知'}</span></p>
          <p>Plan：<span className="text-amber-300">{planLabel || '未指定'}</span></p>
        </div>
        <button
          onClick={simulatePayment}
          disabled={status === 'processing'}
          className="w-full bg-amber-500 text-zinc-900 py-3 rounded-lg font-semibold disabled:opacity-60"
        >
          {status === 'processing' ? '模擬中...' : '模擬付款成功'}
        </button>
        {message && (
          <div
            className={`text-sm ${
              status === 'error' ? 'text-red-300' : 'text-emerald-300'
            }`}
          >
            {message}
          </div>
        )}
        <div className="flex justify-center gap-6 text-sm text-zinc-400">
          <button onClick={() => router.back()} className="underline">
            ← 回上一頁
          </button>
          <Link href="/" className="underline">
            返回首頁
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">載入中...</div>}>
      <MockCheckoutContent />
    </Suspense>
  )
}
