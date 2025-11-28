'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
import { LoadingState, LockedState, PageHeader, EmptyState } from '@/components/ui'
import { formatDate } from '@/lib/constants'
import { ImprovementDashboard } from '@/components/ImprovementDashboard'

function groupByDate(logs: PracticeLog[]): Record<string, PracticeLog[]> {
  return logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('zh-TW')
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {} as Record<string, PracticeLog[]>)
}

export default function PracticePage() {
  const { user, loading, subscription } = useAuth()
  const [logs, setLogs] = useState<PracticeLog[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [improvement, setImprovement] = useState<ImprovementData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
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
        // 預設展開最近一天
        if (logsData.length > 0) {
          const firstDate = new Date(logsData[0].created_at).toLocaleDateString('zh-TW')
          setExpandedDates(new Set([firstDate]))
        }
      }
      setLoadingData(false)
    }
    if (!loading) load()
  }, [user, loading])

  const groupedLogs = useMemo(() => groupByDate(logs), [logs])
  const getLesson = (id: string) => lessons.find(l => l.id === id)
  
  const toggleDate = (date: string) => {
    setExpandedDates(prev => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

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
          <EmptyState emoji="📊" title="還沒有練習數據" description="從任一課程點擊「已完成」開始累積練習紀錄" actionText="開始練習" actionHref="/" />
        )}

        {tab === 'logs' && logs.length === 0 && (
          <EmptyState emoji="📝" title="還沒有練習紀錄" description="在課程頁點 📝 記錄練習心得" actionText="開始練習" actionHref="/" />
        )}

        {tab === 'logs' && logs.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div
                key={date}
                className="
                  velocity-shine
                  bg-zinc-800 rounded-2xl overflow-hidden
                  border-2 border-zinc-700
                  [clip-path:polygon(0_8px,8px_0,100%_0,100%_calc(100%-8px),calc(100%-8px)_100%,0_100%)]
                "
              >
                {/* 日期折疊按鈕 - Alpine Velocity 風格 */}
                <button
                  onClick={() => toggleDate(date)}
                  className="
                    w-full p-4
                    flex justify-between items-center
                    text-left
                    hover:bg-zinc-700/30
                    active:bg-zinc-700/50
                    transition-all
                  "
                >
                  <span
                    className="text-lg font-bold text-gradient-velocity"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {date}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 font-bold text-xs">
                      {dateLogs.length} 筆
                    </span>
                    <span className="text-lg">
                      {expandedDates.has(date) ? '▼' : '▶'}
                    </span>
                  </span>
                </button>

                {/* 記錄列表 */}
                {expandedDates.has(date) && (
                  <div className="border-t border-zinc-700">
                    {dateLogs.map(log => {
                      const lesson = getLesson(log.lesson_id)
                      const isExpanded = expanded === log.id
                      return (
                        <div
                          key={log.id}
                          className="border-b border-zinc-700/50 last:border-0"
                        >
                          {/* 記錄卡片 */}
                          <button
                            onClick={() => setExpanded(isExpanded ? null : log.id)}
                            className="
                              w-full p-4
                              text-left
                              hover:bg-zinc-700/20
                              active:bg-zinc-700/40
                              transition-all
                            "
                          >
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <p className="text-sm font-semibold flex-1 leading-snug">
                                {lesson?.title || `課程 ${log.lesson_id}`}
                              </p>
                              {log.rating && (
                                <span className="
                                  flex-shrink-0
                                  px-2.5 py-1
                                  bg-gradient-to-r from-amber-500/30 to-orange-500/30
                                  border border-amber-400/40
                                  rounded-full
                                  text-xs font-bold text-amber-300
                                ">
                                  ⭐ {log.rating}
                                </span>
                              )}
                            </div>
                            {log.note && (
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                💭 {log.note}
                              </p>
                            )}
                          </button>

                          {/* 展開內容 */}
                          {isExpanded && lesson && (
                            <div className="px-4 pb-4 pt-1">
                              <div className="
                                p-3 rounded-lg
                                bg-zinc-900/50
                                border border-zinc-700/50
                              ">
                                <p className="text-xs text-zinc-500 mb-1 font-bold">😰 問題</p>
                                <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                                  {lesson.what}
                                </p>
                                <Link
                                  href={`/lesson/${log.lesson_id}`}
                                  className="
                                    inline-flex items-center gap-1
                                    text-xs font-bold
                                    text-blue-400 hover:text-blue-300
                                    transition-colors
                                  "
                                >
                                  查看課程 →
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
