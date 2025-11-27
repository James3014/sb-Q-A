'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { getSupabase } from '@/lib/supabase'

interface Stats {
  subscriptions: { plan: string; active_count: number; total_count: number }[]
  funnel: { pricing_views: number; plan_clicks: number; purchases: number }
  dailySubs: { date: string; count: number }[]
  totalUsers: number
}

export default function MonetizationPage() {
  const { isReady } = useAdminAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = getSupabase()
      if (!supabase) return

      const [subs, funnel, daily, users] = await Promise.all([
        supabase.rpc('get_subscription_stats'),
        supabase.rpc('get_funnel_stats', { p_days: 30 }),
        supabase.rpc('get_daily_subscriptions', { p_days: 30 }),
        supabase.from('users').select('id', { count: 'exact' }),
      ])

      setStats({
        subscriptions: subs.data || [],
        funnel: funnel.data?.[0] || { pricing_views: 0, plan_clicks: 0, purchases: 0 },
        dailySubs: daily.data || [],
        totalUsers: users.count || 0,
      })
      setLoading(false)
    }

    if (isReady) load()
  }, [isReady])

  const activeUsers = stats?.subscriptions?.reduce((a, s) => a + (s.active_count || 0), 0) || 0
  const conversionRate = stats?.totalUsers ? ((activeUsers / stats.totalUsers) * 100).toFixed(1) : '0'

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="💰 付費分析" />

        <div className="p-4 max-w-2xl mx-auto space-y-6">
          {loading ? (
            <p className="text-zinc-500">載入中...</p>
          ) : (
            <>
              {/* 總覽 */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">總用戶</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">有效訂閱</p>
                  <p className="text-2xl font-bold text-amber-400">{activeUsers}</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">轉換率</p>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <p className="text-zinc-400 text-sm">付費頁瀏覽</p>
                  <p className="text-2xl font-bold">{stats?.funnel.pricing_views || 0}</p>
                </div>
              </section>

              {/* 方案分布 */}
              <section className="bg-zinc-800 rounded-lg p-4">
                <h2 className="font-bold mb-4">📊 方案分布</h2>
                <div className="space-y-3">
                  {stats?.subscriptions?.map(s => {
                    const percent = stats.totalUsers ? ((s.active_count / stats.totalUsers) * 100).toFixed(1) : '0'
                    return (
                      <div key={s.plan}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{s.plan}</span>
                          <span>{s.active_count} 有效 / {s.total_count} 總計 ({percent}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded">
                          <div className="h-2 rounded bg-amber-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {(!stats?.subscriptions || stats.subscriptions.length === 0) && (
                    <p className="text-zinc-500">尚無訂閱數據</p>
                  )}
                </div>
              </section>

              {/* 轉換漏斗 */}
              <section className="bg-zinc-800 rounded-lg p-4">
                <h2 className="font-bold mb-4">🔻 轉換漏斗（近 30 天）</h2>
                <div className="space-y-2">
                  <FunnelBar label="瀏覽付費頁" value={stats?.funnel.pricing_views || 0} max={stats?.funnel.pricing_views || 1} />
                  <FunnelBar label="點擊方案" value={stats?.funnel.plan_clicks || 0} max={stats?.funnel.pricing_views || 1} />
                  <FunnelBar label="完成購買" value={stats?.funnel.purchases || 0} max={stats?.funnel.pricing_views || 1} />
                </div>
              </section>

              {/* 每日購買量 */}
              <section className="bg-zinc-800 rounded-lg p-4">
                <h2 className="font-bold mb-4">📈 每日購買量（近 30 天）</h2>
                {stats?.dailySubs && stats.dailySubs.length > 0 ? (
                  <div className="flex items-end gap-1 h-32">
                    {stats.dailySubs.map(d => {
                      const max = Math.max(...stats.dailySubs.map(x => x.count), 1)
                      const height = (d.count / max) * 100
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-blue-500 rounded-t" 
                            style={{ height: `${height}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                            title={`${d.date}: ${d.count}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-zinc-500">尚無購買數據</p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </AdminLayout>
  )
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percent = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 bg-zinc-700 rounded">
        <div className="h-3 rounded bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
