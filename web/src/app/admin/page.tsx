'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { getDashboardStats, getContentGaps, getLessonSources } from '@/lib/admin'
import { StatCard } from '@/components/ui'
import { formatDate } from '@/lib/constants'

interface Stats {
  dau: number
  wau: number
  topLessons: { lesson_id: string; title: string; view_count: number }[]
  subscriptions: { subscription_type: string; count: number }[]
  recentFeedback: { id: string; type: string; content: string; created_at: string }[]
  topKeywords: { keyword: string; count: number }[]
  contentGaps: { keyword: string; count: number }[]
  lessonSources: { source: string; count: number }[]
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

function ContentGaps({ gaps }: { gaps?: Stats['contentGaps'] }) {
  return (
    <section className="bg-zinc-800 rounded-lg p-4">
      <h2 className="font-bold mb-3">🔍 內容缺口（搜尋無結果）</h2>
      {(!gaps || gaps.length === 0) ? (
        <p className="text-zinc-500 text-sm">尚無數據（用戶搜尋找不到的關鍵字會顯示在這裡）</p>
      ) : (
        <div className="space-y-2">
          {gaps.map((g, i) => (
            <div key={g.keyword} className="flex justify-between text-sm">
              <span className="text-red-400">{i + 1}. {g.keyword}</span>
              <span className="text-zinc-500">{g.count} 次</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function LessonSources({ sources }: { sources?: Stats['lessonSources'] }) {
  const total = sources?.reduce((a, s) => a + s.count, 0) || 0
  const labels: Record<string, string> = { home: '首頁', search: '搜尋', category: '分類', filter: '篩選', related: '相關課程', direct: '直接訪問', unknown: '未知' }
  return (
    <section className="bg-zinc-800 rounded-lg p-4">
      <h2 className="font-bold mb-3">📊 課程來源分析</h2>
      {(!sources || sources.length === 0) ? (
        <p className="text-zinc-500 text-sm">尚無數據</p>
      ) : (
        <div className="space-y-2">
          {sources.map(s => {
            const pct = total ? ((s.count / total) * 100).toFixed(1) : 0
            return (
              <div key={s.source} className="flex justify-between text-sm">
                <span className="text-zinc-300">{labels[s.source] || s.source}</span>
                <span className="text-zinc-500">{s.count} ({pct}%)</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function QuickInsights({ stats }: { stats: Stats | null }) {
  if (!stats) return null
  
  const insights: { icon: string; text: string; type: 'info' | 'warn' | 'success' }[] = []
  
  // 分析內容缺口
  if (stats.contentGaps && stats.contentGaps.length > 0) {
    const top = stats.contentGaps[0]
    insights.push({
      icon: '🔍',
      text: `「${top.keyword}」被搜尋 ${top.count} 次但找不到，考慮新增相關課程`,
      type: 'warn'
    })
  }
  
  // 分析來源
  if (stats.lessonSources && stats.lessonSources.length > 0) {
    const total = stats.lessonSources.reduce((a, s) => a + s.count, 0)
    const searchPct = stats.lessonSources.find(s => s.source === 'search')?.count || 0
    const relatedPct = stats.lessonSources.find(s => s.source === 'related')?.count || 0
    if (total > 0) {
      if ((searchPct / total) > 0.4) {
        insights.push({ icon: '✅', text: '搜尋功能使用率高，用戶能找到想要的課程', type: 'success' })
      }
      if ((relatedPct / total) > 0.2) {
        insights.push({ icon: '✅', text: '相關課程推薦有效，用戶會點擊延伸學習', type: 'success' })
      }
    }
  }
  
  // 分析熱門搜尋 vs 熱門課程
  if (stats.topKeywords?.length && stats.topLessons?.length) {
    const topKeyword = stats.topKeywords[0]?.keyword
    const topLesson = stats.topLessons[0]?.title
    if (topKeyword && topLesson && !topLesson.includes(topKeyword)) {
      insights.push({
        icon: '💡',
        text: `熱門搜尋「${topKeyword}」與熱門課程不同，可優化課程標題`,
        type: 'info'
      })
    }
  }
  
  if (insights.length === 0) {
    insights.push({ icon: '📊', text: '數據收集中，稍後會有更多洞察', type: 'info' })
  }
  
  return (
    <section className="bg-gradient-to-r from-blue-900/30 to-zinc-800 rounded-lg p-4 border border-blue-600/30">
      <h2 className="font-bold mb-3 text-blue-400">💡 快速洞察</h2>
      <div className="space-y-2">
        {insights.map((i, idx) => (
          <div key={idx} className={`text-sm flex items-start gap-2 ${i.type === 'warn' ? 'text-amber-300' : i.type === 'success' ? 'text-green-300' : 'text-zinc-300'}`}>
            <span>{i.icon}</span>
            <span>{i.text}</span>
          </div>
        ))}
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
              <span>{formatDate(f.created_at)}</span>
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
      Promise.all([getDashboardStats(), getContentGaps(), getLessonSources()]).then(([data, gaps, sources]) => {
        setStats(data ? { ...data, contentGaps: gaps, lessonSources: sources } : null)
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
          {!loading && <QuickInsights stats={stats} />}
          <TopLessons lessons={stats?.topLessons} loading={loading} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopKeywords keywords={stats?.topKeywords} />
            <ContentGaps gaps={stats?.contentGaps} />
          </div>
          <LessonSources sources={stats?.lessonSources} />
          <RecentFeedback feedback={stats?.recentFeedback} />
        </div>
      </main>
    </AdminLayout>
  )
}
