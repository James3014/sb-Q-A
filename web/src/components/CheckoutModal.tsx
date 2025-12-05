'use client'

import { useEffect, useState } from 'react'

interface CheckoutModalProps {
  isOpen: boolean
  status: 'pending' | 'processing' | 'success' | 'error'
  message: string
  onClose?: () => void
}

export function CheckoutModal({ isOpen, status, message, onClose }: CheckoutModalProps) {
  const [displayMessage, setDisplayMessage] = useState(message)

  useEffect(() => {
    setDisplayMessage(message)
  }, [message])

  if (!isOpen) return null

  const getIcon = () => {
    switch (status) {
      case 'pending':
        return <div className="text-5xl">💳</div>
      case 'processing':
        return <div className="inline-block animate-spin text-5xl">⏳</div>
      case 'success':
        return <div className="text-5xl">✅</div>
      case 'error':
        return <div className="text-5xl">❌</div>
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'pending':
        return 'from-blue-600/20 to-indigo-600/20 border-blue-500/30'
      case 'processing':
        return 'from-amber-600/20 to-orange-600/20 border-amber-500/30'
      case 'success':
        return 'from-green-600/20 to-emerald-600/20 border-green-500/30'
      case 'error':
        return 'from-red-600/20 to-rose-600/20 border-red-500/30'
    }
  }

  const getTextColor = () => {
    switch (status) {
      case 'pending':
        return 'text-blue-100'
      case 'processing':
        return 'text-amber-100'
      case 'success':
        return 'text-green-100'
      case 'error':
        return 'text-red-100'
    }
  }

  const getTitleColor = () => {
    switch (status) {
      case 'pending':
        return 'text-blue-300'
      case 'processing':
        return 'text-amber-300'
      case 'success':
        return 'text-green-300'
      case 'error':
        return 'text-red-300'
    }
  }

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={status === 'error' ? onClose : undefined}
        style={{ pointerEvents: status === 'error' ? 'auto' : 'none' }}
      />

      {/* 彈出視窗 */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`
            bg-gradient-to-br ${getBackgroundColor()}
            border rounded-2xl p-8 max-w-md w-full
            text-center backdrop-blur-xl
            transform transition-all duration-300
            shadow-2xl
          `}
        >
          <div className="mb-4">{getIcon()}</div>

          <h2 className={`text-2xl font-bold mb-2 ${getTitleColor()}`}>
            {status === 'pending' && '準備支付'}
            {status === 'processing' && '處理中...'}
            {status === 'success' && (displayMessage.includes('即將跳轉') ? '訂單建立成功！' : '支付成功！')}
            {status === 'error' && '支付失敗'}
          </h2>

          <p className={`${getTextColor()} mb-6 text-sm leading-relaxed`}>
            {displayMessage}
          </p>

          {status === 'processing' && (
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}

          {status === 'error' && onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              關閉
            </button>
          )}
        </div>
      </div>
    </>
  )
}
