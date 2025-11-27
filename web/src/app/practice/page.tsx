'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'

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

  if (loading || loadingData) {
    return <main className="min-h-screen bg-zinc-900 text-white p-4"><p className="text-center text-zinc-400 mt-20">載入中...</p></main>
  }

  if (!user || !subscription.isActive) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white p-4">
        <Link href="/" className="text-zinc-400 text-sm">← 返回首頁</Link>
        <div className="text-center mt-20">
          <p className="text-5xl mb-4">🔒</p>
          <p className="text-zinc-400 mb-2">練習紀錄為付費功能</p>
          <p className="text-zinc-500 text-sm mb-6">升級後可記錄練習進度</p>
          <Link href="/pricing" className="inline-block bg-amber-600 px-6 py-3 rounded-lg mr-3">
            查看方案
          </Link>
          {!user && (
            <Link href="/login" className="inline-block bg-zinc-700 px-6 py-3 rounded-lg">
              登入
            </Link>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400">←</Link>
          <h1 className="text-xl font-bold">📝 練習紀錄</h1>
        </div>
      </header>

      <div className="p-4">
        {logs.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-zinc-400 mb-2">還沒有練習紀錄</p>
            <p className="text-zinc-500 text-sm mb-6">在課程頁點 📝 記錄練習心得</p>
            <Link href="/" className="inline-block bg-blue-600 px-6 py-3 rounded-lg">
              開始練習
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map(log => {
              const lesson = getLesson(log.lesson_id)
              const isExpanded = expanded === log.id
              return (
                <div key={log.id} className="bg-zinc-800 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setExpanded(isExpanded ? null : log.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{lesson?.title || `課程 ${log.lesson_id}`}</p>
                      <span className="text-xs text-zinc-400">
                        {new Date(log.created_at).toLocaleDateString('zh-TW')}
                      </span>
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
                      <Link 
                        href={`/lesson/${log.lesson_id}`}
                        className="block text-center text-sm text-blue-400 py-2"
                      >
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
