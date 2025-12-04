'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentFailureContent() {
  const searchParams = useSearchParams()
  const paymentError = searchParams.get('payment_error')

  const errorMessages: Record<string, string> = {
    V0001: '請求錯誤，請檢查輸入資料',
    V0002: '交易狀態錯誤',
    T0001: '交易失敗',
    T0002: '安全碼 (CVV) 錯誤',
    T0003: '卡片已過期',
    T0004: '額度不足',
    T0005: '拒絕授權',
    F0001: '系統錯誤，請稍後再試',
  }

  const message = paymentError ? errorMessages[paymentError] || `錯誤代碼：${paymentError}` : '支付被取消或失敗'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-red-500 text-5xl mb-4">✕</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">支付失敗</h1>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-gray-700">
          <p className="font-semibold mb-2">常見問題：</p>
          <ul className="text-left space-y-1 text-xs">
            <li>• 確認卡片資訊無誤</li>
            <li>• 檢查卡片是否有足夠額度</li>
            <li>• 確認卡片尚未過期</li>
            <li>• 聯繫銀行確認是否被限制</li>
          </ul>
        </div>

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

        <p className="text-xs text-gray-500 mt-4">
          如問題持續，請<Link href="/contact" className="text-indigo-600 hover:underline">聯繫客服</Link>
        </p>
      </div>
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">載入中...</div>}>
      <PaymentFailureContent />
    </Suspense>
  )
}
