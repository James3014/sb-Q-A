'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
import { LoadingState, LockedState, PageHeader, EmptyState } from '@/components/ui'
import { formatDate } from '@/lib/constants'
import { ImprovementDashboard } from '@/components/ImprovementDashboard'

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
          <EmptyState emoji="📊" title="還沒有練習數據" description="從任一課程點擊「已完成」開始累積練習紀錄" actionText="開始練習" actionHref="/" />
        )}

        {tab === 'logs' && logs.length === 0 && (
          <EmptyState emoji="📝" title="還沒有練習紀錄" description="在課程頁點 📝 記錄練習心得" actionText="開始練習" actionHref="/" />
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
                        <span className="text-xs text-zinc-500">{formatDate(log.created_at)}</span>
                      </div>
                    </div>
                    {log.note && <p className="text-sm text-zinc-400 mt-1">💭 {log.note}</p>}
                  </button>
                  {isExpanded && lesson && (
                    <div className="px-4 pb-4 border-t border-zinc-700 pt-3">
                      <p className="text-xs text-zinc-500 mb-1">😰 問題</p>
                      <p className="text-sm text-zinc-300 mb-3">{lesson.what}</p>
                      <Link href={`/lesson/${log.lesson_id}`} className="text-sm text-blue-400">查看完整課程 →</Link>
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
