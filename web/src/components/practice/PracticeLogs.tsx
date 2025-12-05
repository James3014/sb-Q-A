import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PracticeLog } from '@/lib/practice'
import { Lesson } from '@/lib/lessons'
import { formatDate } from '@/lib/constants'
import { EmptyState } from '@/components/ui'

function groupByDate(logs: PracticeLog[]): Record<string, PracticeLog[]> {
  return logs.reduce((acc, log) => {
    const date = formatDate(log.created_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {} as Record<string, PracticeLog[]>)
}

interface Props {
  logs: PracticeLog[]
  lessons: Lesson[]
}

export function PracticeLogs({ logs, lessons }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedDates, setExpandedDates] = useState<Set<string>>(() => {
    if (logs.length > 0) {
      const firstDate = formatDate(logs[0].created_at)
      return new Set([firstDate])
    }
    return new Set()
  })

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

  if (logs.length === 0) {
    return <EmptyState emoji="📝" title="還沒有練習紀錄" description="完成課程後紀錄練習心得" />
  }

  return (
    <div className="p-4 space-y-4">
      {Object.entries(groupedLogs).map(([date, dateLogs]) => (
        <div key={date} className="bg-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleDate(date)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-750"
          >
            <span className="font-medium">{date}</span>
            <span className="text-zinc-400 text-sm">{dateLogs.length} 次練習 {expandedDates.has(date) ? '▼' : '▶'}</span>
          </button>

          {expandedDates.has(date) && (
            <div className="border-t border-zinc-700">
              {dateLogs.map(log => {
                const lesson = getLesson(log.lesson_id)
                return (
                  <div key={log.id} className="p-4 border-b border-zinc-700 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <Link href={`/lesson/${log.lesson_id}`} className="text-blue-400 hover:underline flex-1">
                        {lesson?.title || `課程 ${log.lesson_id}`}
                      </Link>
                      <button
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        className="text-zinc-400 text-sm ml-2"
                      >
                        {expanded === log.id ? '收起' : '展開'}
                      </button>
                    </div>

                    <div className="text-sm text-zinc-400 mb-2">{formatDate(log.created_at)}</div>

                    {expanded === log.id && log.note && (
                      <div className="mt-2 p-3 bg-zinc-900 rounded text-sm text-zinc-300">{log.note}</div>
                    )}

                    {log.rating1 && (
                      <div className="flex gap-4 text-xs text-zinc-400 mt-2">
                        <span>理解 {log.rating1}/5</span>
                        <span>成功 {log.rating2}/5</span>
                        <span>穩定 {log.rating3}/5</span>
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
  )
}
