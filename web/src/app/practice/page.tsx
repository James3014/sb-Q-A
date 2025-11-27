'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
import { LoadingState, LockedState, PageHeader, EmptyState } from '@/components/ui'

// 技能對應推薦課程
const SKILL_RECOMMENDATIONS: Record<string, string[]> = {
  '用刃': ['後刃卡住', '刃轉換', '邊刃掌控'],
  '旋轉': ['下肢旋轉', '軸轉技巧', '轉彎控制'],
  '壓力控制': ['壓力轉換', '重心控制', '彈跳吸收'],
  '站姿與平衡': ['基本站姿', '重心居中', '平衡練習'],
  '時機與協調性': ['節奏控制', '動作連貫', '時機掌握'],
}

function ImprovementDashboard({ data, lessons }: { data: ImprovementData; lessons: Lesson[] }) {
  const [trendDays, setTrendDays] = useState<7 | 30>(30)
  
  const improvementColor = data.improvement >= 0 ? 'text-green-400' : 'text-red-400'
  const improvementSign = data.improvement >= 0 ? '↑' : '↓'
  const hasEnoughData = data.totalPractices >= 6

  // 找出最弱技能
  const weakSkill = data.skills.length > 0 
    ? data.skills.reduce((min, s) => s.score < min.score ? s : min, data.skills[0])
    : null

  // 計算最後練習距今天數
  const lastPracticeDate = data.recentPractice?.[0]?.date
  const daysSinceLastPractice = lastPracticeDate 
    ? Math.floor((Date.now() - new Date(lastPracticeDate).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // 篩選趨勢資料
  const filteredTrend = trendDays === 7 ? data.trend.slice(-7) : data.trend

  // 找推薦課程
  const getRecommendedLessons = (skill: string) => {
    const keywords = SKILL_RECOMMENDATIONS[skill] || []
    return lessons
      .filter(l => keywords.some(k => l.title.includes(k) || l.what?.includes(k)))
      .slice(0, 3)
  }

  return (
    <div className="space-y-4">
      {/* 改善度 Summary */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <h3 className="font-bold text-sm mb-3">📈 技能改善度</h3>
        {hasEnoughData ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-3xl font-bold ${improvementColor}`}>
                {improvementSign} {Math.abs(data.improvement).toFixed(1)}
              </span>
              <span className="text-zinc-400 text-sm">分</span>
            </div>
            <p className="text-xs text-zinc-500">
              最近 3 次平均 - 最早 3 次平均
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-zinc-400 text-sm mb-2">
              尚未累積足夠資料（{data.totalPractices}/6 次）
            </p>
            <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${(data.totalPractices / 6) * 100}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500">完成 6 次練習後解鎖改善趨勢</p>
          </div>
        )}
      </div>

      {/* 總覽 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800 rounded-lg p-3 text-center">
          <p className="text-zinc-400 text-xs">總練習</p>
          <p className="text-xl font-bold">{data.totalPractices}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3 text-center">
          <p className="text-zinc-400 text-xs">技能數</p>
          <p className="text-xl font-bold">{data.skills.length}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3 text-center">
          <p className="text-zinc-400 text-xs">平均分</p>
          <p className="text-xl font-bold">
            {data.scores.length > 0 
              ? (data.scores.reduce((a, s) => a + s.score, 0) / data.scores.length).toFixed(1)
              : '-'
            }
          </p>
        </div>
      </div>

      {/* CASI 技能分布（含弱項標註） */}
      {data.skills.length > 0 ? (
        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-3">🎯 CASI 技能分布</h3>
          <div className="space-y-2">
            {data.skills.map(s => {
              const isWeak = s.score < 3
              return (
                <div key={s.skill}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1">
                      {isWeak && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                      {s.skill}
                    </span>
                    <span className={isWeak ? 'text-red-400' : ''}>{s.score.toFixed(1)} ({s.count}次)</span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded">
                    <div 
                      className={`h-2 rounded ${isWeak ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${(s.score / 5) * 100}%` }} 
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg p-4 text-center">
          <p className="text-zinc-400 text-sm">🎯 尚未有技能分類資料</p>
          <p className="text-xs text-zinc-500 mt-1">開始練習以解鎖技能雷達圖</p>
        </div>
      )}

      {/* 弱項提示 + 推薦課程 */}
      {weakSkill && weakSkill.score < 4 && (
        <div className="bg-gradient-to-r from-amber-900/30 to-zinc-800 rounded-lg p-4 border border-amber-600/30">
          <h3 className="font-bold text-sm mb-2 text-amber-400">🎯 建議加強：{weakSkill.skill}</h3>
          <p className="text-xs text-zinc-400 mb-3">
            根據你的練習資料，這是目前分數最低的技能（{weakSkill.score.toFixed(1)} 分）
          </p>
          {(() => {
            const recommended = getRecommendedLessons(weakSkill.skill)
            return recommended.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">推薦課程：</p>
                {recommended.map(l => (
                  <Link 
                    key={l.id} 
                    href={`/lesson/${l.id}`}
                    className="block bg-zinc-700/50 rounded p-2 text-sm hover:bg-zinc-700 transition"
                  >
                    {l.title}
                  </Link>
                ))}
              </div>
            ) : (
              <Link href="/" className="text-sm text-amber-400">
                瀏覽相關課程 →
              </Link>
            )
          })()}
        </div>
      )}

      {/* 久未練習提示 */}
      {daysSinceLastPractice !== null && daysSinceLastPractice >= 5 && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-blue-600/30">
          <p className="text-sm">
            🏂 已經 <span className="text-blue-400 font-bold">{daysSinceLastPractice}</span> 天沒練習囉！
          </p>
          <p className="text-xs text-zinc-500 mt-1">試試看回到雪場核心技巧的習題吧</p>
          <Link href="/" className="inline-block mt-2 text-sm text-blue-400">
            開始練習 →
          </Link>
        </div>
      )}

      {/* 練習趨勢（可切換 7/30 天） */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm">📊 練習趨勢</h3>
          <div className="flex gap-1">
            <button 
              onClick={() => setTrendDays(7)}
              className={`px-2 py-1 text-xs rounded ${trendDays === 7 ? 'bg-blue-600' : 'bg-zinc-700'}`}
            >
              7天
            </button>
            <button 
              onClick={() => setTrendDays(30)}
              className={`px-2 py-1 text-xs rounded ${trendDays === 30 ? 'bg-blue-600' : 'bg-zinc-700'}`}
            >
              30天
            </button>
          </div>
        </div>
        {filteredTrend.length > 0 ? (
          <>
            <div className="flex items-end gap-1 h-20">
              {filteredTrend.map(t => {
                const max = Math.max(...filteredTrend.map(x => x.count), 1)
                const height = (t.count / max) * 100
                return (
                  <div key={t.date} className="flex-1">
                    <div 
                      className="w-full bg-green-500 rounded-t" 
                      style={{ height: `${height}%`, minHeight: t.count > 0 ? '4px' : '0' }}
                      title={`${t.date}: ${t.count}`}
                    />
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-zinc-500 mt-2 text-center">
              共 {filteredTrend.reduce((a, t) => a + t.count, 0)} 次練習
            </p>
          </>
        ) : (
          <p className="text-zinc-500 text-sm text-center py-4">近期沒有練習紀錄</p>
        )}
      </div>

      {/* 最近練習 */}
      {data.recentPractice && data.recentPractice.length > 0 && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-3">📅 最近練習</h3>
          <div className="space-y-2">
            {data.recentPractice.slice(0, 5).map((p, i) => (
              <Link 
                key={i} 
                href={`/lesson/${p.lesson_id}`}
                className="flex justify-between items-center text-sm hover:bg-zinc-700 rounded p-2 -mx-2"
              >
                <span className="text-zinc-300 truncate flex-1">{p.title}</span>
                <div className="flex items-center gap-2">
                  {p.score > 0 && (
                    <span className="text-xs">⭐{p.score}</span>
                  )}
                  <span className="text-xs text-zinc-500">
                    {new Date(p.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PracticePage() {
  const { user, loading, subscription } = useAuth()
  const [logs, setLogs] = useState<PracticeLog[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [improvement, setImprovement] = useState<ImprovementData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tab, setTab] = useState<'dashboard' | 'logs'>('dashboard')

  useEffect(() => {
    const load = async () => {
      const allLessons = await getLessons()
      setLessons(allLessons)
      if (user) {
        const [logsData, improvementData] = await Promise.all([
          getPracticeLogs(user.id),
          getImprovementData(user.id),
        ])
        setLogs(logsData)
        setImprovement(improvementData)
      }
      setLoadingData(false)
    }
    if (!loading) load()
  }, [user, loading])

  const getLesson = (id: string) => lessons.find(l => l.id === id)

  if (loading || loadingData) return <LoadingState />

  if (!user || !subscription.isActive) {
    return <LockedState title="練習紀錄為付費功能" description="升級後可記錄練習進度" showLogin={!user} />
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <PageHeader title="練習中心" emoji="🏂" />
      
      <div className="flex border-b border-zinc-800">
        <button 
          onClick={() => setTab('dashboard')}
          className={`flex-1 py-3 text-sm font-medium ${tab === 'dashboard' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
        >
          📊 改善度
        </button>
        <button 
          onClick={() => setTab('logs')}
          className={`flex-1 py-3 text-sm font-medium ${tab === 'logs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-zinc-400'}`}
        >
          📝 紀錄 ({logs.length})
        </button>
      </div>

      <div className="p-4">
        {tab === 'dashboard' && improvement && improvement.totalPractices > 0 && (
          <ImprovementDashboard data={improvement} lessons={lessons} />
        )}

        {tab === 'dashboard' && (!improvement || improvement.totalPractices === 0) && (
          <EmptyState 
            emoji="📊" 
            title="還沒有練習數據" 
            description="從任一課程點擊「已完成」開始累積練習紀錄" 
            actionText="開始練習" 
            actionHref="/" 
          />
        )}

        {tab === 'logs' && logs.length === 0 && (
          <EmptyState 
            emoji="📝" 
            title="還沒有練習紀錄" 
            description="在課程頁點 📝 記錄練習心得" 
            actionText="開始練習" 
            actionHref="/" 
          />
        )}

        {tab === 'logs' && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map(log => {
              const lesson = getLesson(log.lesson_id)
              const isExpanded = expanded === log.id
              return (
                <div key={log.id} className="bg-zinc-800 rounded-lg overflow-hidden">
                  <button onClick={() => setExpanded(isExpanded ? null : log.id)} className="w-full p-4 text-left">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm flex-1">{lesson?.title || `課程 ${log.lesson_id}`}</p>
                      <div className="flex items-center gap-2">
                        {log.rating && <span className="text-xs">⭐{log.rating}</span>}
                        <span className="text-xs text-zinc-500">
                          {new Date(log.created_at).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                    </div>
                    {log.note && <p className="text-sm text-zinc-400 mt-1">💭 {log.note}</p>}
                  </button>
                  {isExpanded && lesson && (
                    <div className="px-4 pb-4 border-t border-zinc-700 pt-3">
                      <p className="text-xs text-zinc-500 mb-1">😰 問題</p>
                      <p className="text-sm text-zinc-300 mb-3">{lesson.what}</p>
                      <Link href={`/lesson/${log.lesson_id}`} className="text-sm text-blue-400">
                        查看完整課程 →
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
