'use client'
import { PageContainer } from '@/components/ui';

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { trackEvent } from '@/lib/analytics'

function PlanCard({ 
  plan, 
  price, 
  label, 
  features, 
  highlight,
  badge 
}: { 
  plan: string
  price: string
  label?: string
  features: string[]
  highlight?: boolean
  badge?: string
}) {
  const handleSelect = () => {
    trackEvent('plan_selected', undefined, { plan })
  }

  return (
    <div 
      onClick={handleSelect}
      className={`rounded-lg p-4 mb-4 cursor-pointer transition-all hover:scale-[1.02] ${
        highlight 
          ? 'bg-gradient-to-b from-amber-900/50 to-zinc-800 border border-amber-600/50' 
          : 'bg-zinc-800'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold ${highlight ? 'text-amber-400' : ''}`}>{label || plan}</h3>
        {badge && <span className="text-xs bg-amber-600 px-2 py-0.5 rounded">{badge}</span>}
      </div>
      <p className="text-2xl font-bold mb-3">{price}</p>
      <ul className="text-sm space-y-1">
        {features.map((f, i) => (
          <li key={i} className={highlight ? 'text-amber-200' : 'text-zinc-300'}>{f}</li>
        ))}
      </ul>
    </div>
  )
}

export default function PricingPage() {
  const { user } = useAuth()

  useEffect(() => {
    trackEvent('pricing_view')
  }, [])

  return (
    <PageContainer>
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400">←</Link>
          <h1 className="text-xl font-bold">方案與價格</h1>
        </div>
      </header>

      <div className="p-4 max-w-lg mx-auto">
        
        <PlanCard 
          plan="free"
          price="$0"
          label="免費版"
          features={[
            '✓ 28 堂初級課程',
            '✓ 搜尋 / 篩選',
            '✓ 試閱中級課程（僅問題區塊）',
          ]}
        />

        {/* 短期 PASS */}
        <div className="bg-gradient-to-b from-blue-900/50 to-zinc-800 rounded-lg p-4 mb-4 border border-blue-600/50">
          <h3 className="font-bold mb-2 text-blue-400">短期 PASS</h3>
          <p className="text-zinc-400 text-sm mb-3">適合短期雪旅</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div 
              onClick={() => trackEvent('plan_selected', undefined, { plan: '7day' })}
              className="bg-zinc-700/50 rounded p-3 text-center cursor-pointer hover:bg-zinc-600/50 transition"
            >
              <p className="text-lg font-bold">$180</p>
              <p className="text-xs text-zinc-400">7 天</p>
            </div>
            <div 
              onClick={() => trackEvent('plan_selected', undefined, { plan: '30day' })}
              className="bg-zinc-700/50 rounded p-3 text-center cursor-pointer hover:bg-zinc-600/50 transition"
            >
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
            '✓ 練習紀錄 + 改善曲線',
            '✓ 課程組合推薦（未來）',
          ]}
        />

        {/* 開通說明 */}
        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">📝 如何購買</h3>
          <ol className="text-sm text-zinc-300 space-y-2">
            <li>1. 選擇方案</li>
            <li>2. 聯繫我們完成付款</li>
            <li>3. 提供註冊 Email：<span className="text-amber-400">{user?.email || '請先登入'}</span></li>
            <li>4. 24 小時內開通</li>
          </ol>
          <p className="text-zinc-500 text-xs mt-3">付款方式請洽客服</p>
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
    </PageContainer>
  )
}
