'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin } from '@/lib/admin'
import { getSupabase } from '@/lib/supabase'

interface Stats {
  subscriptions: { type: string; count: number }[]
  pricingViews: number
  totalUsers: number
}

export default function MonetizationPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = getSupabase()
      if (!supabase) return

      const [subs, pricing, users] = await Promise.all([
        supabase.rpc('get_subscription_stats'),
        supabase.from('event_log').select('id', { count: 'exact' }).eq('event_type', 'pricing_view'),
        supabase.from('users').select('id', { count: 'exact' }),
      ])

      setStats({
        subscriptions: subs.data || [],
        pricingViews: pricing.count || 0,
        totalUsers: users.count || 0,
      })
      setLoadingData(false)
    }

    if (!loading && user && isAdmin(user.email)) {
      load()
    }
  }, [user, loading])

  if (loading) return <div className="min-h-screen bg-zinc-900 text-white p-4">載入中...</div>

  if (!user || !isAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <p className="text-center mt-20 text-zinc-400">無權限存取</p>
      </div>
    )
  }

  const paidUsers = stats?.subscriptions?.filter(s => s.type !== 'free').reduce((a, s) => a + s.count, 0) || 0
  const conversionRate = stats?.totalUsers ? ((paidUsers / stats.totalUsers) * 100).toFixed(1) : '0'

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">💰 付費分析</h1>
          <Link href="/admin" className="text-sm text-zinc-400">← 返回</Link>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {loadingData ? (
          <p className="text-zinc-500">載入中...</p>
        ) : (
          <>
            {/* 總覽 */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-zinc-400 text-sm">總用戶</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-zinc-400 text-sm">付費用戶</p>
                <p className="text-2xl font-bold">{paidUsers}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-zinc-400 text-sm">轉換率</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-zinc-400 text-sm">付費頁瀏覽</p>
                <p className="text-2xl font-bold">{stats?.pricingViews || 0}</p>
              </div>
            </section>

            {/* 方案分布 */}
            <section className="bg-zinc-800 rounded-lg p-4">
              <h2 className="font-bold mb-4">📊 方案分布</h2>
              <div className="space-y-3">
                {stats?.subscriptions?.map(s => {
                  const percent = stats.totalUsers ? ((s.count / stats.totalUsers) * 100).toFixed(1) : '0'
                  return (
                    <div key={s.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{s.type || 'free'}</span>
                        <span>{s.count} ({percent}%)</span>
                      </div>
                      <div className="h-2 bg-zinc-700 rounded">
                        <div
                          className={`h-2 rounded ${s.type === 'free' ? 'bg-zinc-500' : 'bg-amber-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 漏斗 */}
            <section className="bg-zinc-800 rounded-lg p-4">
              <h2 className="font-bold mb-4">🔻 轉換漏斗</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>總用戶</span>
                  <span>{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>→ 看過付費頁</span>
                  <span>{stats?.pricingViews || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>→ 付費</span>
                  <span>{paidUsers}</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
