'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { getLessonStats, getLessonEffectiveness } from '@/lib/admin'
import { getLessons, Lesson } from '@/lib/lessons'

interface LessonStat {
  id: string
  title: string
  is_premium: boolean
  level_tags?: string[]
  views: number
  practices: number
  favorites: number
}

interface Effectiveness {
  lesson_id: string
  title: string
  avg_score: number
  samples: number
}

type HeatmapType = 'level' | 'skill' | 'slope'

export default function LessonsPage() {
  const { isReady } = useAdminAuth()
  const [lessons, setLessons] = useState<LessonStat[]>([])
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [effectiveness, setEffectiveness] = useState<Effectiveness[]>([])
  const [tab, setTab] = useState<'stats' | 'effectiveness' | 'heatmap'>('stats')
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('level')
  const [sortBy, setSortBy] = useState<'views' | 'practices' | 'favorites'>('views')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterPremium, setFilterPremium] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isReady) {
      Promise.all([getLessonStats(), getLessonEffectiveness(), getLessons()]).then(([stats, eff, all]) => {
        setLessons(stats)
        setEffectiveness(eff)
        setAllLessons(all)
        setLoading(false)
      })
    }
  }, [isReady])

  // 篩選
  let filtered = lessons
  if (filterLevel !== 'all') filtered = filtered.filter(l => l.level_tags?.includes(filterLevel))
  if (filterPremium === 'free') filtered = filtered.filter(l => !l.is_premium)
  else if (filterPremium === 'pro') filtered = filtered.filter(l => l.is_premium)
  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy])

  // 熱力圖資料
  const getHeatmapData = () => {
    const statsMap = new Map(lessons.map(l => [l.id, l]))
    
    if (heatmapType === 'level') {
      const levels = ['beginner', 'intermediate', 'advanced']
      return levels.map(level => {
        const levelLessons = allLessons.filter(l => l.level_tags?.includes(level))
        const stats = levelLessons.map(l => statsMap.get(l.id)).filter(Boolean) as LessonStat[]
        return {
          label: level === 'beginner' ? '初級' : level === 'intermediate' ? '中級' : '進階',
          count: levelLessons.length,
          views: stats.reduce((a, s) => a + s.views, 0),
          practices: stats.reduce((a, s) => a + s.practices, 0),
          favorites: stats.reduce((a, s) => a + s.favorites, 0),
        }
      })
    }
    
    if (heatmapType === 'skill') {
      const skills = ['站姿與平衡', '旋轉', '用刃', '壓力控制', '時機與協調性']
      return skills.map(skill => {
        const skillLessons = allLessons.filter(l => l.casi?.Primary_Skill === skill)
        const stats = skillLessons.map(l => statsMap.get(l.id)).filter(Boolean) as LessonStat[]
        return {
          label: skill,
          count: skillLessons.length,
          views: stats.reduce((a, s) => a + s.views, 0),
          practices: stats.reduce((a, s) => a + s.practices, 0),
          favorites: stats.reduce((a, s) => a + s.favorites, 0),
        }
      })
    }
    
    // slope
    const slopes = ['green', 'blue', 'black', 'mogul', 'powder', 'park', 'tree']
    return slopes.map(slope => {
      const slopeLessons = allLessons.filter(l => l.slope_tags?.includes(slope))
      const stats = slopeLessons.map(l => statsMap.get(l.id)).filter(Boolean) as LessonStat[]
      const labels: Record<string, string> = {
        green: '綠道', blue: '藍道', black: '黑道', mogul: '蘑菇', 
        powder: '粉雪', park: '公園', tree: '樹林'
      }
      return {
        label: labels[slope] || slope,
        count: slopeLessons.length,
        views: stats.reduce((a, s) => a + s.views, 0),
        practices: stats.reduce((a, s) => a + s.practices, 0),
        favorites: stats.reduce((a, s) => a + s.favorites, 0),
      }
    })
  }

  const heatmapData = getHeatmapData()
  const maxViews = Math.max(...heatmapData.map(d => d.views), 1)

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📚 課程分析" />

        {/* Tab 切換 */}
        <div className="flex border-b border-zinc-800">
          <button 
            onClick={() => setTab('stats')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'stats' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
          >
            📊 熱門課程
          </button>
          <button 
            onClick={() => setTab('effectiveness')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'effectiveness' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
          >
            🎯 有效度
          </button>
          <button 
            onClick={() => setTab('heatmap')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'heatmap' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
          >
            🔥 熱力圖
          </button>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          {loading ? (
            <p className="text-zinc-500">載入中...</p>
          ) : tab === 'stats' ? (
            <>
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

              {/* 統計總覽 */}
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
                <p className="text-sm text-zinc-400 mb-2">
                  🎯 課程有效度 = 用戶練習後的平均評分（至少 3 筆資料）
                </p>
                <p className="text-xs text-zinc-500">
                  分數越高，代表用戶練習後感覺進步越明顯
                </p>
              </div>

              {effectiveness.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">尚無足夠練習數據</p>
              ) : (
                <div className="space-y-2">
                  {effectiveness.map((e, i) => (
                    <div key={e.lesson_id} className="bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${i < 3 ? 'text-amber-400' : 'text-zinc-500'}`}>
                          {i + 1}
                        </span>
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
          ) : (
            /* 熱力圖 Tab */
            <div className="space-y-4">
              {/* 類型切換 */}
              <div className="flex gap-2">
                {(['level', 'skill', 'slope'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setHeatmapType(t)}
                    className={`px-3 py-2 rounded text-sm ${heatmapType === t ? 'bg-blue-600' : 'bg-zinc-800'}`}
                  >
                    {t === 'level' ? '程度' : t === 'skill' ? 'CASI 技能' : '雪道類型'}
                  </button>
                ))}
              </div>

              {/* 熱力圖 */}
              <div className="space-y-3">
                {heatmapData.map(d => (
                  <div key={d.label} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{d.label}</span>
                      <span className="text-xs text-zinc-500">{d.count} 堂課</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">瀏覽</p>
                        <div className="h-4 bg-zinc-700 rounded overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${(d.views / maxViews) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs mt-1">{d.views}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">練習</p>
                        <div className="h-4 bg-zinc-700 rounded overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${(d.practices / maxViews) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs mt-1">{d.practices}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500 text-xs mb-1">收藏</p>
                        <div className="h-4 bg-zinc-700 rounded overflow-hidden">
                          <div 
                            className="h-full bg-red-500" 
                            style={{ width: `${(d.favorites / maxViews) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs mt-1">{d.favorites}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  )
}
