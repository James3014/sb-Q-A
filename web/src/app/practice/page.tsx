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
          <div className="space-y-3">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date} className="bg-zinc-800 rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleDate(date)} 
                  className="w-full p-3 flex justify-between items-center text-left hover:bg-zinc-700/50"
                >
                  <span className="font-medium">{date}</span>
                  <span className="text-zinc-400 text-sm">
                    {dateLogs.length} 筆 {expandedDates.has(date) ? '▼' : '▶'}
                  </span>
                </button>
                {expandedDates.has(date) && (
                  <div className="border-t border-zinc-700">
                    {dateLogs.map(log => {
                      const lesson = getLesson(log.lesson_id)
                      const isExpanded = expanded === log.id
                      return (
                        <div key={log.id} className="border-b border-zinc-700/50 last:border-0">
                          <button onClick={() => setExpanded(isExpanded ? null : log.id)} className="w-full p-3 text-left">
                            <div className="flex justify-between items-start">
                              <p className="text-sm flex-1">{lesson?.title || `課程 ${log.lesson_id}`}</p>
                              {log.rating && <span className="text-xs">⭐{log.rating}</span>}
                            </div>
                            {log.note && <p className="text-xs text-zinc-400 mt-1">💭 {log.note}</p>}
                          </button>
                          {isExpanded && lesson && (
                            <div className="px-3 pb-3 pt-1">
                              <p className="text-xs text-zinc-500 mb-1">😰 問題</p>
                              <p className="text-xs text-zinc-300 mb-2">{lesson.what}</p>
                              <Link href={`/lesson/${log.lesson_id}`} className="text-xs text-blue-400">查看課程 →</Link>
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
