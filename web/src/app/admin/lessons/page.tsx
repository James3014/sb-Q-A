'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin, getLessonStats } from '@/lib/admin'

interface LessonStat {
  id: string
  title: string
  is_premium: boolean
  level_tags?: string[]
  views: number
  practices: number
  favorites: number
}

export default function LessonsPage() {
  const { user, loading } = useAuth()
  const [lessons, setLessons] = useState<LessonStat[]>([])
  const [sortBy, setSortBy] = useState<'views' | 'practices' | 'favorites'>('views')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterPremium, setFilterPremium] = useState<string>('all')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && user && isAdmin(user.email)) {
      getLessonStats().then(data => {
        setLessons(data)
        setLoadingData(false)
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

  // 篩選
  let filtered = lessons
  if (filterLevel !== 'all') {
    filtered = filtered.filter(l => l.level_tags?.includes(filterLevel))
  }
  if (filterPremium === 'free') {
    filtered = filtered.filter(l => !l.is_premium)
  } else if (filterPremium === 'pro') {
    filtered = filtered.filter(l => l.is_premium)
  }

  // 排序
  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">📚 課程分析</h1>
          <Link href="/admin" className="text-sm text-zinc-400">← 返回</Link>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        {/* 篩選 */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex gap-2 items-center">
            <span className="text-zinc-400 text-sm">程度：</span>
            {['all', 'beginner', 'intermediate', 'advanced'].map(l => (
              <button
                key={l}
                onClick={() => setFilterLevel(l)}
                className={`px-2 py-1 rounded text-xs ${filterLevel === l ? 'bg-green-600' : 'bg-zinc-800'}`}
              >
                {l === 'all' ? '全部' : l === 'beginner' ? '初級' : l === 'intermediate' ? '中級' : '進階'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-zinc-400 text-sm">類型：</span>
            {['all', 'free', 'pro'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPremium(p)}
                className={`px-2 py-1 rounded text-xs ${filterPremium === p ? 'bg-amber-600' : 'bg-zinc-800'}`}
              >
                {p === 'all' ? '全部' : p === 'free' ? '免費' : 'PRO'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-zinc-400 text-sm">排序：</span>
            {(['views', 'practices', 'favorites'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded text-xs ${sortBy === s ? 'bg-blue-600' : 'bg-zinc-800'}`}
              >
                {s === 'views' ? '瀏覽' : s === 'practices' ? '練習' : '收藏'}
              </button>
            ))}
          </div>
        </div>

        {/* 統計摘要 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <p className="text-zinc-400 text-xs">篩選結果</p>
            <p className="text-xl font-bold">{sorted.length}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <p className="text-zinc-400 text-xs">總瀏覽</p>
            <p className="text-xl font-bold">{sorted.reduce((a, l) => a + l.views, 0)}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <p className="text-zinc-400 text-xs">總練習</p>
            <p className="text-xl font-bold">{sorted.reduce((a, l) => a + l.practices, 0)}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <p className="text-zinc-400 text-xs">總收藏</p>
            <p className="text-xl font-bold">{sorted.reduce((a, l) => a + l.favorites, 0)}</p>
          </div>
        </div>

        {/* 課程列表 */}
        {loadingData ? (
          <p className="text-zinc-500">載入中...</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((l, i) => (
              <div key={l.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-sm w-6">{i + 1}.</span>
                    <span className="truncate">{l.title}</span>
                    {l.is_premium && (
                      <span className="text-xs px-1 bg-amber-600/50 rounded">PRO</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-zinc-400">
                  <span>👁 {l.views}</span>
                  <span>📝 {l.practices}</span>
                  <span>❤️ {l.favorites}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
