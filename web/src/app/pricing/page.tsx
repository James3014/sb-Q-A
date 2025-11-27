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
          <h1 className="text-xl font-bold">方案與價格</h1>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        
        {/* Free */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
          <h3 className="font-bold mb-2">免費版</h3>
          <p className="text-2xl font-bold mb-3">$0</p>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>✓ 28 堂初級課程</li>
            <li>✓ 搜尋 / 篩選</li>
            <li>✓ 試閱中級課程（僅問題區塊）</li>
            <li className="text-zinc-600">✗ PRO 課程完整內容</li>
            <li className="text-zinc-600">✗ 收藏功能</li>
            <li className="text-zinc-600">✗ 練習紀錄</li>
          </ul>
        </div>

        {/* 短期 PASS */}
        <div className="bg-gradient-to-b from-blue-900/50 to-zinc-800 rounded-lg p-4 mb-4 border border-blue-600/50">
          <h3 className="font-bold mb-2 text-blue-400">短期 PASS</h3>
          <p className="text-zinc-400 text-sm mb-3">適合短期雪旅</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-700/50 rounded p-3 text-center">
              <p className="text-lg font-bold">$180</p>
              <p className="text-xs text-zinc-400">7 天</p>
            </div>
            <div className="bg-zinc-700/50 rounded p-3 text-center">
              <p className="text-lg font-bold">$290</p>
              <p className="text-xs text-zinc-400">30 天</p>
            </div>
          </div>
          
          <ul className="text-sm space-y-1">
            <li>✓ 全部 213 堂課程</li>
            <li>✓ 收藏功能</li>
            <li>✓ 練習紀錄 / 自評 / 趨勢</li>
          </ul>
        </div>

        {/* PRO 年費 */}
        <div className="bg-gradient-to-b from-amber-900/50 to-zinc-800 rounded-lg p-4 mb-6 border border-amber-600/50">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-amber-400">PRO 年費</h3>
            <span className="text-xs bg-amber-600 px-2 py-0.5 rounded">最划算</span>
          </div>
          <p className="text-2xl font-bold mb-3">$490-690<span className="text-sm font-normal text-zinc-400">/年</span></p>
          
          <ul className="text-sm space-y-1">
            <li className="text-amber-200">✓ 全部課程（213+）</li>
            <li className="text-amber-200">✓ 雪季更新內容</li>
            <li>✓ 收藏功能</li>
            <li>✓ 練習紀錄 + 改善曲線</li>
            <li>✓ 課程組合推薦（未來）</li>
          </ul>
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
            <li>1. 選擇方案並完成付款</li>
            <li>2. 截圖付款證明</li>
            <li>3. 傳送到 Line：@snowboard-qa</li>
            <li>4. 附上註冊 Email：<span className="text-amber-400">{user?.email || '請先登入'}</span></li>
            <li>5. 24 小時內開通</li>
          </ol>
        </div>

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
              <p className="text-zinc-300">Q: 可以退款嗎？</p>
              <p className="text-zinc-500">A: 購買後 7 天內可全額退款</p>
            </div>
            <div>
              <p className="text-zinc-300">Q: PASS 到期後怎麼辦？</p>
              <p className="text-zinc-500">A: 可續購或升級年費方案</p>
            </div>
            <div>
              <p className="text-zinc-300">Q: 會有新課程嗎？</p>
              <p className="text-zinc-500">A: 會持續更新，PRO 年費用戶免費獲得</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
