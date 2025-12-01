'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { Lesson } from '@/lib/lessons'
import { fetchAdminLessons, LessonStat, LessonEffectiveness, LessonHealth } from '@/lib/adminData'
import { LessonHeatmap } from '@/components/LessonHeatmap'

export default function LessonsPage() {
  const { isReady } = useAdminAuth()
  const [lessons, setLessons] = useState<LessonStat[]>([])
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [effectiveness, setEffectiveness] = useState<LessonEffectiveness[]>([])
  const [health, setHealth] = useState<LessonHealth[]>([])
  const [tab, setTab] = useState<'stats' | 'effectiveness' | 'health' | 'heatmap'>('stats')
  const [sortBy, setSortBy] = useState<'views' | 'practices' | 'favorites'>('views')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterPremium, setFilterPremium] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const body = await fetchAdminLessons()
      if (body) {
        setLessons(body.lessonStats || [])
        setEffectiveness(body.effectiveness || [])
        setAllLessons(body.lessons || [])
        setHealth(body.lessonHealth || [])
      }
      setLoading(false)
    }
    if (isReady) load()
  }, [isReady])

  let filtered = lessons
  if (filterLevel !== 'all') filtered = filtered.filter(l => l.level_tags?.includes(filterLevel))
  if (filterPremium === 'free') filtered = filtered.filter(l => !l.is_premium)
  else if (filterPremium === 'pro') filtered = filtered.filter(l => l.is_premium)
  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📚 課程分析" />

        <div className="flex border-b border-zinc-800">
          {[
            { key: 'stats', label: '📊 熱門' },
            { key: 'effectiveness', label: '🎯 有效度' },
            { key: 'health', label: '🩺 健康度' },
            { key: 'heatmap', label: '🔥 熱力圖' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-3 text-sm font-medium ${tab === t.key ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {loading ? (
            <p className="text-zinc-500">載入中...</p>
          ) : tab === 'stats' ? (
            <>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex gap-2 items-center">
                  <span className="text-zinc-400 text-sm">程度：</span>
                  {[{ k: 'all', l: '全部' }, { k: 'beginner', l: '初級' }, { k: 'intermediate', l: '中級' }, { k: 'advanced', l: '進階' }].map(({ k, l }) => (
                    <button key={k} onClick={() => setFilterLevel(k)} className={`px-2 py-1 rounded text-xs ${filterLevel === k ? 'bg-green-600' : 'bg-zinc-800'}`}>{l}</button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-zinc-400 text-sm">類型：</span>
                  {[{ k: 'all', l: '全部' }, { k: 'free', l: '免費' }, { k: 'pro', l: 'PRO' }].map(({ k, l }) => (
                    <button key={k} onClick={() => setFilterPremium(k)} className={`px-2 py-1 rounded text-xs ${filterPremium === k ? 'bg-amber-600' : 'bg-zinc-800'}`}>{l}</button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-zinc-400 text-sm">排序：</span>
                  {[{ k: 'views', l: '瀏覽' }, { k: 'practices', l: '練習' }, { k: 'favorites', l: '收藏' }].map(({ k, l }) => (
                    <button key={k} onClick={() => setSortBy(k as typeof sortBy)} className={`px-2 py-1 rounded text-xs ${sortBy === k ? 'bg-blue-600' : 'bg-zinc-800'}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: '篩選結果', value: sorted.length },
                  { label: '總瀏覽', value: sorted.reduce((a, l) => a + l.views, 0) },
                  { label: '總練習', value: sorted.reduce((a, l) => a + l.practices, 0) },
                  { label: '總收藏', value: sorted.reduce((a, l) => a + l.favorites, 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-zinc-800 rounded-lg p-3 text-center">
                    <p className="text-zinc-400 text-xs">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {sorted.slice(0, 50).map((l, i) => (
                  <div key={l.id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-sm w-6">{i + 1}.</span>
                        <span className="truncate">{l.title}</span>
                        {l.is_premium && <span className="text-xs px-1 bg-amber-600/50 rounded">PRO</span>}
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
            </>
          ) : tab === 'effectiveness' ? (
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-sm text-zinc-400 mb-2">🎯 課程有效度 = 用戶練習後的平均評分（至少 3 筆資料）</p>
                <p className="text-xs text-zinc-500">分數越高，代表用戶練習後感覺進步越明顯</p>
              </div>
              {effectiveness.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">尚無足夠練習數據</p>
              ) : (
                <div className="space-y-2">
                  {effectiveness.map((e, i) => (
                    <div key={e.lesson_id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${i < 3 ? 'text-amber-400' : 'text-zinc-500'}`}>{i + 1}</span>
                        <span className="truncate">{e.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-400">{e.samples} 筆</span>
                        <span className={`text-lg font-bold ${e.avg_score >= 4 ? 'text-green-400' : e.avg_score >= 3 ? 'text-blue-400' : 'text-zinc-400'}`}>
                          {e.avg_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === 'health' ? (
            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-sm text-zinc-400 mb-2">🩺 課程健康度 = 滾動完成率 × 40% + 練習完成率 × 60%</p>
                <p className="text-xs text-zinc-500">低分課程需要改善（內容太長、不吸引人、或練習門檻太高）</p>
              </div>
              {health.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">尚無足夠數據（需要用戶滾動和練習行為）</p>
              ) : (
                <div className="space-y-2">
                  {health.map((h, i) => {
                    const title = allLessons.find(l => l.id === h.lesson_id)?.title || h.lesson_id
                    return (
                      <div key={h.lesson_id} className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="truncate flex-1">{title}</span>
                          <span className={`text-lg font-bold ${h.healthScore >= 60 ? 'text-green-400' : h.healthScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {h.healthScore.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-zinc-500">
                          <span>📜 滾動完成 {h.scrollRate.toFixed(0)}%</span>
                          <span>📝 練習完成 {h.practiceRate.toFixed(0)}%</span>
                          <span>{h.samples} 筆</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <LessonHeatmap lessons={allLessons} stats={lessons} />
          )}
        </div>
      </main>
    </AdminLayout>
  )
}
