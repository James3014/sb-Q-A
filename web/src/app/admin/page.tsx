'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { getDashboardStats } from '@/lib/admin'

interface Stats {
  dau: number
  wau: number
  topLessons: { lesson_id: string; title: string; view_count: number }[]
  subscriptions: { subscription_type: string; count: number }[]
  recentFeedback: { id: string; type: string; content: string; created_at: string }[]
  topKeywords: { keyword: string; count: number }[]
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4">
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function TopLessons({ lessons, loading }: { lessons?: Stats['topLessons']; loading: boolean }) {
  return (
    <section className="bg-zinc-800 rounded-lg p-4">
      <h2 className="font-bold mb-3">🔥 熱門課程 TOP 10</h2>
      {loading ? <p className="text-zinc-500">載入中...</p> : (
        <div className="space-y-2">
          {lessons?.map((l, i) => (
            <div key={l.lesson_id} className="flex justify-between text-sm">
              <span className="text-zinc-300">{i + 1}. {l.title || l.lesson_id}</span>
              <span className="text-zinc-500">{l.view_count} 次</span>
            </div>
          ))}
          {(!lessons || lessons.length === 0) && <p className="text-zinc-500">尚無數據</p>}
        </div>
      )}
    </section>
  )
}

function TopKeywords({ keywords }: { keywords?: Stats['topKeywords'] }) {
  return (
    <section className="bg-zinc-800 rounded-lg p-4">
      <h2 className="font-bold mb-3">🔍 熱門搜尋</h2>
      <div className="flex flex-wrap gap-2">
        {keywords?.map(k => (
          <span key={k.keyword} className="px-2 py-1 bg-zinc-700 rounded text-sm">
            {k.keyword} ({k.count})
          </span>
        ))}
        {(!keywords || keywords.length === 0) && <p className="text-zinc-500">尚無數據</p>}
      </div>
    </section>
  )
}

function RecentFeedback({ feedback }: { feedback?: Stats['recentFeedback'] }) {
  return (
    <section className="bg-zinc-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold">📬 最新回報</h2>
        <Link href="/admin/feedback" className="text-sm text-blue-400">查看全部</Link>
      </div>
      <div className="space-y-3">
        {feedback?.map(f => (
          <div key={f.id} className="border-b border-zinc-700 pb-2">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{f.type}</span>
              <span>{new Date(f.created_at).toLocaleDateString('zh-TW')}</span>
            </div>
            <p className="text-sm text-zinc-300">{f.content.slice(0, 100)}</p>
          </div>
        ))}
        {(!feedback || feedback.length === 0) && <p className="text-zinc-500">尚無回報</p>}
      </div>
    </section>
  )
}

export default function AdminPage() {
  const { isReady } = useAdminAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isReady) {
      getDashboardStats().then(data => {
        setStats(data)
        setLoading(false)
      })
    }
  }, [isReady])

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📊 後台 Dashboard" />
        <div className="p-4 max-w-4xl mx-auto space-y-6">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="今日活躍 (DAU)" value={loading ? '-' : stats?.dau || 0} />
            <StatCard label="本週活躍 (WAU)" value={loading ? '-' : stats?.wau || 0} />
            {stats?.subscriptions?.map(s => (
              <StatCard key={s.subscription_type} label={s.subscription_type || 'free'} value={s.count} />
            ))}
          </section>
          <TopLessons lessons={stats?.topLessons} loading={loading} />
          <TopKeywords keywords={stats?.topKeywords} />
          <RecentFeedback feedback={stats?.recentFeedback} />
        </div>
      </main>
    </AdminLayout>
  )
}
