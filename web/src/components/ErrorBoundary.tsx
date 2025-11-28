'use client'

import { Component, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-5xl mb-4">🏔️</p>
            <h1 className="text-xl font-bold mb-2">發生錯誤</h1>
            <p className="text-zinc-400 mb-6">頁面載入時發生問題</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg active:scale-95 transition-all"
              >
                🔄 重新載入
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
