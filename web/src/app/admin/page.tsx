'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin, getDashboardStats } from '@/lib/admin'

interface Stats {
  dau: number
  wau: number
  topLessons: { lesson_id: string; title: string; view_count: number }[]
  subscriptions: { subscription_type: string; count: number }[]
  recentFeedback: { id: string; type: string; content: string; created_at: string }[]
  topKeywords: { keyword: string; count: number }[]
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && user && isAdmin(user.email)) {
      getDashboardStats().then(data => {
        setStats(data)
        setLoadingStats(false)
      })
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

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">📊 後台 Dashboard</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/admin/feedback" className="text-blue-400">回報</Link>
            <Link href="/admin/lessons" className="text-blue-400">課程</Link>
            <Link href="/admin/monetization" className="text-blue-400">付費</Link>
            <Link href="/" className="text-zinc-400">← 前台</Link>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* 活躍統計 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">今日活躍 (DAU)</p>
            <p className="text-2xl font-bold">{loadingStats ? '-' : stats?.dau || 0}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-sm">本週活躍 (WAU)</p>
            <p className="text-2xl font-bold">{loadingStats ? '-' : stats?.wau || 0}</p>
          </div>
          {stats?.subscriptions?.map(s => (
            <div key={s.subscription_type} className="bg-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">{s.subscription_type || 'free'}</p>
              <p className="text-2xl font-bold">{s.count}</p>
            </div>
          ))}
        </section>

        {/* 熱門課程 */}
        <section className="bg-zinc-800 rounded-lg p-4">
          <h2 className="font-bold mb-3">🔥 熱門課程 TOP 10</h2>
          {loadingStats ? (
            <p className="text-zinc-500">載入中...</p>
          ) : (
            <div className="space-y-2">
              {stats?.topLessons?.map((l, i) => (
                <div key={l.lesson_id} className="flex justify-between text-sm">
                  <span className="text-zinc-300">{i + 1}. {l.title || l.lesson_id}</span>
                  <span className="text-zinc-500">{l.view_count} 次</span>
                </div>
              ))}
              {(!stats?.topLessons || stats.topLessons.length === 0) && (
                <p className="text-zinc-500">尚無數據</p>
              )}
            </div>
          )}
        </section>

        {/* 熱門搜尋 */}
        <section className="bg-zinc-800 rounded-lg p-4">
          <h2 className="font-bold mb-3">🔍 熱門搜尋</h2>
          <div className="flex flex-wrap gap-2">
            {stats?.topKeywords?.map(k => (
              <span key={k.keyword} className="px-2 py-1 bg-zinc-700 rounded text-sm">
                {k.keyword} ({k.count})
              </span>
            ))}
            {(!stats?.topKeywords || stats.topKeywords.length === 0) && (
              <p className="text-zinc-500">尚無數據</p>
            )}
          </div>
        </section>

        {/* 最新回報 */}
        <section className="bg-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">📬 最新回報</h2>
            <Link href="/admin/feedback" className="text-sm text-blue-400">查看全部</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentFeedback?.map(f => (
              <div key={f.id} className="border-b border-zinc-700 pb-2">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{f.type}</span>
                  <span>{new Date(f.created_at).toLocaleDateString('zh-TW')}</span>
                </div>
                <p className="text-sm text-zinc-300">{f.content.slice(0, 100)}</p>
              </div>
            ))}
            {(!stats?.recentFeedback || stats.recentFeedback.length === 0) && (
              <p className="text-zinc-500">尚無回報</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
