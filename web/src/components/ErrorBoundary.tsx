'use client'

import { Component, ReactNode, ErrorInfo } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logging'
import { getUserFriendlyMessage } from '@/lib/errors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 使用統一的日誌系統記錄錯誤
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack
    })

    // 調用可選的錯誤處理回調
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // 如果提供了自定義 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 獲取用戶友善的錯誤訊息
      const userMessage = getUserFriendlyMessage(this.state.error)

      return (
        <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <p className="text-5xl mb-4">🏔️</p>
              <h1 className="text-xl font-bold mb-2">發生錯誤</h1>
              <p className="text-zinc-400 mb-6">{userMessage}</p>
            </div>

            {/* 開發環境顯示詳細錯誤 */}
            {process.env.NODE_ENV === 'development' && (
              <details className="rounded bg-slate-800 p-4 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-300">
                  技術細節
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-400">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg active:scale-95 transition-all"
              >
                🔄 重試
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-lg active:scale-95 transition-all"
              >
                ← 返回首頁
              </Link>
            </div>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
