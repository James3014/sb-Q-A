'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { isAdmin, getAllFeedback } from '@/lib/admin'

const TYPE_LABELS: Record<string, string> = {
  bug: '🐛 問題',
  lesson_request: '📚 課程許願',
  feature_request: '✨ 功能許願',
  other: '💬 其他',
}

interface Feedback {
  id: string
  type: string
  content: string
  page: string | null
  lesson_id: string | null
  created_at: string
  user_id: string | null
}

export default function FeedbackPage() {
  const { user, loading } = useAuth()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && user && isAdmin(user.email)) {
      getAllFeedback().then(data => {
        setFeedback(data)
        setLoadingData(false)
      })
    }
  }, [user, loading])

  if (loading) return <div className="min-h-screen bg-zinc-900 text-white p-4">載入中...</div>

  if (!user || !isAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-4">
        <p className="text-center mt-20 text-zinc-400">無權限存取</p>
      </div>
    )
  }

  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.type === filter)

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">📬 回報管理</h1>
          <Link href="/admin" className="text-sm text-zinc-400">← 返回</Link>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {/* 篩選 */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['all', 'bug', 'lesson_request', 'feature_request', 'other'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                filter === t ? 'bg-blue-600' : 'bg-zinc-800'
              }`}
            >
              {t === 'all' ? '全部' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <p className="text-zinc-500 text-sm mb-4">共 {filtered.length} 筆</p>

        {/* 列表 */}
        <div className="space-y-4">
          {loadingData ? (
            <p className="text-zinc-500">載入中...</p>
          ) : filtered.length === 0 ? (
            <p className="text-zinc-500">尚無回報</p>
          ) : (
            filtered.map(f => (
              <div key={f.id} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm px-2 py-0.5 bg-zinc-700 rounded">
                    {TYPE_LABELS[f.type] || f.type}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(f.created_at).toLocaleString('zh-TW')}
                  </span>
                </div>
                <p className="text-zinc-200 mb-2">{f.content}</p>
                {f.lesson_id && (
                  <p className="text-xs text-zinc-500">課程 ID: {f.lesson_id}</p>
                )}
                {f.page && (
                  <p className="text-xs text-zinc-500 truncate">頁面: {f.page}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
