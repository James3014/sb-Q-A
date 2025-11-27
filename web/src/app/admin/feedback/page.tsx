'use client'

import { useState, useEffect } from 'react'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { getAllFeedback } from '@/lib/admin'
import { FEEDBACK_TYPE_LABELS, formatDate } from '@/lib/constants'

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
  const { isReady } = useAdminAuth()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (isReady) {
      getAllFeedback().then(data => {
        setFeedback(data)
        setLoadingData(false)
      })
    }
  }, [isReady])

  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.type === filter)

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📬 回報管理" />

        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {['all', 'bug', 'lesson_request', 'feature_request', 'other'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded text-sm whitespace-nowrap ${filter === t ? 'bg-blue-600' : 'bg-zinc-800'}`}
              >
                {t === 'all' ? '全部' : FEEDBACK_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <p className="text-zinc-500 text-sm mb-4">共 {filtered.length} 筆</p>

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
                      {FEEDBACK_TYPE_LABELS[f.type] || f.type}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDate(f.created_at)}
                    </span>
                  </div>
                  <p className="text-zinc-200 mb-2">{f.content}</p>
                  {f.lesson_id && <p className="text-xs text-zinc-500">課程 ID: {f.lesson_id}</p>}
                  {f.page && <p className="text-xs text-zinc-500 truncate">頁面: {f.page}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
