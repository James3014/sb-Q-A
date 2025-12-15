'use client'

import type { Lesson } from '@/types/lessons'

export interface LessonManageTableProps {
  lessons: Lesson[]
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const formatDate = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function LessonManageTable({ lessons, isLoading, onEdit, onDelete }: LessonManageTableProps) {
  if (isLoading) {
    return <p className="text-sm text-zinc-400">載入中...</p>
  }

  if (lessons.length === 0) {
    return <p className="text-sm text-zinc-400">尚未建立任何課程</p>
  }

  return (
    <div className="overflow-x-auto rounded border border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-800 text-sm text-white">
        <thead className="bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-zinc-400">課程 ID</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-400">標題</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-400">狀態</th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-400">建立時間</th>
            <th className="px-4 py-3 text-right font-semibold text-zinc-400">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-900/40">
          {lessons.map(lesson => (
            <tr key={lesson.id}>
              <td className="px-4 py-3 align-top font-mono text-xs text-zinc-500">{lesson.id}</td>
              <td className="px-4 py-3 align-top">
                <div className="font-semibold">{lesson.title}</div>
                <div className="text-xs text-zinc-500">
                  {lesson.level_tags?.join(' / ') || '未設定'} · {lesson.slope_tags?.join(' / ') || '未設定'}
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                <span className={`rounded px-2 py-1 text-xs ${lesson.is_published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-200'}`}>
                  {lesson.is_published ? '已發布' : '草稿'}
                </span>
                {lesson.is_premium && (
                  <span className="ml-2 rounded px-2 py-1 text-xs bg-amber-500/20 text-amber-200">PRO</span>
                )}
              </td>
              <td className="px-4 py-3 align-top text-zinc-400">{formatDate(lesson.created_at)}</td>
              <td className="px-4 py-3 align-top text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(lesson.id)}
                    className="rounded border border-blue-500 px-3 py-1 text-xs text-blue-200 hover:bg-blue-500/20"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => onDelete(lesson.id)}
                    className="rounded border border-red-500 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
