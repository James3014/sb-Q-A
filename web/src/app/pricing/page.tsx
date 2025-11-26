'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function PricingPage() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400">←</Link>
          <h1 className="text-xl font-bold">升級 PRO</h1>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        {/* 免費 vs PRO 比較 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">免費版</h3>
            <p className="text-2xl font-bold mb-3">$0</p>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li>✓ 28 堂初級課程</li>
              <li>✓ 收藏功能</li>
              <li>✓ 練習紀錄</li>
              <li className="text-zinc-600">✗ 進階課程</li>
            </ul>
          </div>
          <div className="bg-gradient-to-b from-amber-900/50 to-zinc-800 rounded-lg p-4 border border-amber-600/50">
            <h3 className="font-bold mb-2 text-amber-400">PRO 版</h3>
            <p className="text-2xl font-bold mb-3">$299<span className="text-sm font-normal text-zinc-400">/永久</span></p>
            <ul className="text-sm space-y-2">
              <li className="text-amber-200">✓ 全部 213 堂課程</li>
              <li>✓ 收藏功能</li>
              <li>✓ 練習紀錄</li>
              <li className="text-amber-200">✓ 未來更新</li>
            </ul>
          </div>
        </div>

        {/* 付款方式 */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">💳 付款方式</h3>
          
          <div className="space-y-4">
            <div className="bg-zinc-700/50 rounded p-3">
              <p className="font-medium mb-2">銀行轉帳</p>
              <p className="text-sm text-zinc-400">銀行：國泰世華 (013)</p>
              <p className="text-sm text-zinc-400">帳號：123-456789-0</p>
              <p className="text-sm text-zinc-400">戶名：單板教學</p>
            </div>

            <div className="bg-zinc-700/50 rounded p-3">
              <p className="font-medium mb-2">Line Pay / 街口</p>
              <p className="text-sm text-zinc-400">ID：@snowboard-qa</p>
            </div>
          </div>
        </div>

        {/* 開通說明 */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">📝 開通流程</h3>
          <ol className="text-sm text-zinc-300 space-y-2">
            <li>1. 完成付款</li>
            <li>2. 截圖付款證明</li>
            <li>3. 傳送到 Line：@snowboard-qa</li>
            <li>4. 附上註冊 Email：<span className="text-amber-400">{user?.email || '請先登入'}</span></li>
            <li>5. 24 小時內開通</li>
          </ol>
        </div>

        {!user && (
          <Link href="/login" className="block w-full bg-blue-600 hover:bg-blue-500 text-center py-3 rounded-lg font-medium">
            請先登入
          </Link>
        )}

        {/* FAQ */}
        <div className="mt-8">
          <h3 className="font-bold mb-3">常見問題</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-zinc-300">Q: 可以退款嗎？</p>
              <p className="text-zinc-500">A: 購買後 7 天內可全額退款</p>
            </div>
            <div>
              <p className="text-zinc-300">Q: 會有新課程嗎？</p>
              <p className="text-zinc-500">A: 會持續更新，PRO 用戶免費獲得</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
