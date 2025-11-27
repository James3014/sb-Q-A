'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'
import { LoadingState, LockedState, PageHeader, EmptyState } from '@/components/ui'

export default function PracticePage() {
  const { user, loading, subscription } = useAuth()
  const [logs, setLogs] = useState<PracticeLog[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const allLessons = await getLessons()
      setLessons(allLessons)
      if (user) {
        const data = await getPracticeLogs(user.id)
        setLogs(data)
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
      <div className="p-4">
        {logs.length === 0 ? (
          <EmptyState emoji="📝" title="還沒有練習紀錄" description="在課程頁點 📝 記錄練習心得" actionText="開始練習" actionHref="/" />
        ) : (
          <div className="space-y-6">
            {logs.map(log => {
              const lesson = getLesson(log.lesson_id)
              const isExpanded = expanded === log.id
              return (
                <div key={log.id} className="bg-zinc-800 rounded-lg overflow-hidden">
                  <button onClick={() => setExpanded(isExpanded ? null : log.id)} className="w-full p-4 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{lesson?.title || `課程 ${log.lesson_id}`}</p>
                      <span className="text-xs text-zinc-400">{new Date(log.created_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                    {log.note && <p className="text-sm text-zinc-300 mb-2">💭 {log.note}</p>}
                    <p className="text-xs text-zinc-500">{isExpanded ? '▲ 收起' : '▼ 查看課程內容'}</p>
                  </button>
                  {isExpanded && lesson && (
                    <div className="px-4 pb-4 border-t border-zinc-700 pt-3 space-y-3">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">😰 問題</p>
                        <p className="text-sm text-zinc-300">{lesson.what}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">🛠️ 怎麼練</p>
                        <ul className="text-sm text-zinc-300 space-y-1">
                          {lesson.how?.slice(0, 3).map((h, i) => (
                            <li key={i}>{i + 1}. {h.text.replace(/\*\*/g, '').slice(0, 60)}...</li>
                          ))}
                        </ul>
                      </div>
                      <Link href={`/lesson/${log.lesson_id}`} className="block text-center text-sm text-blue-400 py-2">
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
