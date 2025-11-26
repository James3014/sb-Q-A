'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getPracticeLogs, PracticeLog } from '@/lib/practice'
import { getLessons, Lesson } from '@/lib/lessons'

export default function PracticePage() {
  const { user, loading } = useAuth()
  const [logs, setLogs] = useState<PracticeLog[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingData, setLoadingData] = useState(true)

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

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white p-4">
        <Link href="/" className="text-zinc-400 text-sm">← 返回首頁</Link>
        <p className="text-center text-zinc-400 mt-20">請先登入</p>
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
          <p className="text-center text-zinc-500 mt-10">還沒有練習紀錄</p>
        ) : (
          <div className="space-y-3">
            {logs.map(log => {
              const lesson = getLesson(log.lesson_id)
              return (
                <Link key={log.id} href={`/lesson/${log.lesson_id}`}>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <p className="text-sm text-zinc-400 mb-1">
                      {new Date(log.created_at).toLocaleDateString('zh-TW')}
                    </p>
                    <p className="font-medium mb-1">{lesson?.title || `課程 ${log.lesson_id}`}</p>
                    {log.note && <p className="text-sm text-zinc-300">{log.note}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
