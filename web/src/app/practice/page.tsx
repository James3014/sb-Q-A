'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
import { LoadingState, LockedState, PageHeader, EmptyState } from '@/components/ui'

function ImprovementDashboard({ data }: { data: ImprovementData }) {
  const improvementColor = data.improvement >= 0 ? 'text-green-400' : 'text-red-400'
  const improvementSign = data.improvement >= 0 ? '+' : ''

  return (
    <div className="space-y-4 mb-6">
      {/* 總覽 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-800 rounded-lg p-3 text-center">
          <p className="text-zinc-400 text-xs">總練習</p>
          <p className="text-xl font-bold">{data.totalPractices}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3 text-center">
          <p className="text-zinc-400 text-xs">改善度</p>
          <p className={`text-xl font-bold ${improvementColor}`}>
            {improvementSign}{data.improvement.toFixed(1)}
          </p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3 text-center">
          <p className="text-zinc-400 text-xs">技能數</p>
          <p className="text-xl font-bold">{data.skills.length}</p>
        </div>
      </div>

      {/* CASI 技能雷達 */}
      {data.skills.length > 0 && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-3">🎯 CASI 技能分布</h3>
          <div className="space-y-2">
            {data.skills.map(s => (
              <div key={s.skill}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{s.skill}</span>
                  <span>{s.score.toFixed(1)} ({s.count}次)</span>
                </div>
                <div className="h-2 bg-zinc-700 rounded">
                  <div 
                    className="h-2 rounded bg-blue-500" 
                    style={{ width: `${(s.score / 5) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 練習趨勢 */}
      {data.trend.length > 0 && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <h3 className="font-bold text-sm mb-3">📈 近 30 天練習量</h3>
          <div className="flex items-end gap-1 h-16">
            {data.trend.map(t => {
              const max = Math.max(...data.trend.map(x => x.count), 1)
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
      <PageHeader title="練習紀錄" emoji="📝" />
      
      {/* Tab 切換 */}
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
        {tab === 'dashboard' && improvement && (
          <ImprovementDashboard data={improvement} />
        )}

        {tab === 'dashboard' && (!improvement || improvement.totalPractices === 0) && (
          <EmptyState emoji="📊" title="還沒有練習數據" description="完成練習後這裡會顯示改善曲線" actionText="開始練習" actionHref="/" />
        )}

        {tab === 'logs' && logs.length === 0 && (
          <EmptyState emoji="📝" title="還沒有練習紀錄" description="在課程頁點 📝 記錄練習心得" actionText="開始練習" actionHref="/" />
        )}

        {tab === 'logs' && logs.length > 0 && (
          <div className="space-y-4">
            {logs.map(log => {
              const lesson = getLesson(log.lesson_id)
              const isExpanded = expanded === log.id
              return (
                <div key={log.id} className="bg-zinc-800 rounded-lg overflow-hidden">
                  <button onClick={() => setExpanded(isExpanded ? null : log.id)} className="w-full p-4 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">{lesson?.title || `課程 ${log.lesson_id}`}</p>
                      <span className="text-xs text-zinc-400">{new Date(log.created_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                    {log.note && <p className="text-sm text-zinc-300 mb-2">💭 {log.note}</p>}
                    <p className="text-xs text-zinc-500">{isExpanded ? '▲ 收起' : '▼ 展開'}</p>
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
