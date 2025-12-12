'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'

interface DashboardData {
  partner: {
    name: string
    commission_rate: number
  }
  coupons: Array<{
    code: string
    used_count: number
    max_uses: number | null
    is_active: boolean
    link: string
  }>
  stats: {
    total_trials: number
    total_conversions: number
    conversion_rate: number
    total_commissions: number
    pending_commissions: number
    settled_commissions: number
    paid_commissions: number
  }
  time_series: Array<{
    date: string
    trials: number
    conversions: number
  }>
  quarterly: Array<{
    quarter: string
    total_amount: number
    pending_amount: number
    settled_amount: number
    paid_amount: number
  }>
}

export default function AffiliateDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const supabase = getSupabase()
      if (!supabase) throw new Error('系統初始化失敗')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/affiliate/login')
        return
      }

      const res = await fetch('/api/affiliate/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await res.json()
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/affiliate/login')
          return
        }
        throw new Error(result.error || '載入失敗')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/affiliate/login')
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    alert('連結已複製到剪貼簿！')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-6 max-w-md">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <header className="bg-zinc-800 border-b border-zinc-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🤝 合作方儀表板</h1>
            <p className="text-zinc-400">{data.partner.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm"
          >
            登出
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* 關鍵指標 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-zinc-400 text-sm">試用啟用</h3>
            <p className="text-2xl font-bold text-blue-400">{data.stats.total_trials}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-zinc-400 text-sm">轉付費</h3>
            <p className="text-2xl font-bold text-green-400">{data.stats.total_conversions}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-zinc-400 text-sm">轉換率</h3>
            <p className="text-2xl font-bold text-amber-400">{data.stats.conversion_rate}%</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="text-zinc-400 text-sm">總分潤</h3>
            <p className="text-2xl font-bold text-purple-400">NT${data.stats.total_commissions}</p>
          </div>
        </div>

        {/* 折扣碼管理 */}
        <div className="bg-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">🎫 我的折扣碼</h2>
          <div className="space-y-3">
            {data.coupons.map(coupon => (
              <div key={coupon.code} className="bg-zinc-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{coupon.code}</h3>
                    <p className="text-sm text-zinc-400">
                      使用次數: {coupon.used_count}/{coupon.max_uses || '無限'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      coupon.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {coupon.is_active ? '啟用' : '停用'}
                    </span>
                    <button
                      onClick={() => copyLink(coupon.link)}
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs"
                    >
                      複製連結
                    </button>
                  </div>
                </div>
                <div className="bg-zinc-600 rounded p-2 text-xs">
                  <span className="text-zinc-400">分享連結：</span>
                  <span className="text-blue-300">{coupon.link}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分潤統計 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">💰 分潤統計</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">待結算</span>
                <span className="text-amber-400">NT${data.stats.pending_commissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">已結算</span>
                <span className="text-blue-400">NT${data.stats.settled_commissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">已支付</span>
                <span className="text-green-400">NT${data.stats.paid_commissions}</span>
              </div>
              <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold">
                <span>總計</span>
                <span className="text-purple-400">NT${data.stats.total_commissions}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">📊 分潤率</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {(data.partner.commission_rate * 100).toFixed(1)}%
              </div>
              <p className="text-zinc-400 text-sm">
                每筆轉付費訂單可獲得 {(data.partner.commission_rate * 100).toFixed(1)}% 分潤
              </p>
            </div>
          </div>
        </div>

        {/* 季結統計 */}
        {data.quarterly.length > 0 && (
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">📅 季結統計</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2">季度</th>
                    <th className="text-right py-2">總金額</th>
                    <th className="text-right py-2">待結算</th>
                    <th className="text-right py-2">已結算</th>
                    <th className="text-right py-2">已支付</th>
                  </tr>
                </thead>
                <tbody>
                  {data.quarterly.map(q => (
                    <tr key={q.quarter} className="border-b border-zinc-700/50">
                      <td className="py-2">{q.quarter}</td>
                      <td className="text-right py-2">NT${q.total_amount}</td>
                      <td className="text-right py-2 text-amber-400">NT${q.pending_amount}</td>
                      <td className="text-right py-2 text-blue-400">NT${q.settled_amount}</td>
                      <td className="text-right py-2 text-green-400">NT${q.paid_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
