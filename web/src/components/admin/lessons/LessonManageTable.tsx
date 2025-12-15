'use client'

import { useState } from 'react'
import type { Lesson } from '@/types/lessons'
import { LoadingSpinner, EmptyStateNew as EmptyState, StatusBadge } from '@/components/ui'

export interface LessonManageTableProps {
  lessons: Lesson[]
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onBatchPublish?: (ids: string[]) => void
  onBatchDelete?: (ids: string[]) => void
}

const formatDate = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function LessonManageTable({ 
  lessons, 
  isLoading, 
  onEdit, 
  onDelete,
  onBatchPublish,
  onBatchDelete
}: LessonManageTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const selectAll = () => {
    if (selected.size === lessons.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(lessons.map(l => l.id)))
    }
  }

  const handleBatchPublish = () => {
    if (onBatchPublish) {
      onBatchPublish(Array.from(selected))
      setSelected(new Set())
    }
  }

  const handleBatchDelete = () => {
    if (onBatchDelete) {
      onBatchDelete(Array.from(selected))
      setSelected(new Set())
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="載入課程列表..." />
  }

  if (lessons.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="尚未建立任何課程"
        description="點擊上方「建立課程」按鈕來新增第一個課程"
      />
    )
  }

  return (
    <div>
      {/* 批次操作工具列 */}
      {selected.size > 0 && (onBatchPublish || onBatchDelete) && (
        <div className="mb-4 flex items-center justify-between
                        rounded-lg border border-blue-600/50 bg-blue-900/20 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              已選擇 {selected.size} 項
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              取消選擇
            </button>
          </div>
          <div className="flex items-center gap-2">
            {onBatchPublish && (
              <button
                onClick={handleBatchPublish}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg
                           text-sm font-medium transition-colors"
              >
                批次發布
              </button>
            )}
            {onBatchDelete && (
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg
                           text-sm font-medium transition-colors"
              >
                批次刪除
              </button>
            )}
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="min-w-full text-sm text-white">
          <thead className="bg-zinc-900">
            <tr className="border-b border-zinc-800">
              {(onBatchPublish || onBatchDelete) && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === lessons.length && lessons.length > 0}
                    onChange={selectAll}
                    className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left font-semibold text-zinc-400">課程</th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-400">標籤</th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-400">狀態</th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-400">建立時間</th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-400">操作</th>
            </tr>
          </thead>
          <tbody className="bg-zinc-900/40">
            {lessons.map(lesson => (
              <tr
                key={lesson.id}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors"
              >
                {(onBatchPublish || onBatchDelete) && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(lesson.id)}
                      onChange={() => toggleSelect(lesson.id)}
                      className="rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}

                {/* 課程欄位：頭像 + 標題 + ID */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* 課程頭像 */}
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600
                                    flex items-center justify-center text-white text-lg font-bold
                                    shadow-md shadow-blue-500/20">
                      {lesson.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate">{lesson.title}</div>
                      <div className="text-xs text-zinc-400">
                        ID: {lesson.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>

                {/* 標籤欄位 */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {lesson.level_tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
                        {tag}
                      </span>
                    )) || <span className="text-xs text-zinc-500">未設定</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {lesson.slope_tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300">
                        {tag}
                      </span>
                    )) || null}
                  </div>
                </td>

                {/* 狀態欄位 */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <StatusBadge
                      variant={lesson.is_published ? 'success' : 'neutral'}
                      size="sm"
                      showDot
                    >
                      {lesson.is_published ? '已發布' : '草稿'}
                    </StatusBadge>
                    {lesson.is_premium && (
                      <StatusBadge variant="warning" size="sm">
                        PRO
                      </StatusBadge>
                    )}
                  </div>
                </td>

                {/* 建立時間 */}
                <td className="px-4 py-3 text-zinc-400">
                  {formatDate(lesson.created_at)}
                </td>

                {/* 操作按鈕 */}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(lesson.id)}
                      className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs text-blue-200
                                 hover:bg-blue-500/20 transition-colors"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => onDelete(lesson.id)}
                      className="rounded-lg border border-red-500 px-3 py-1.5 text-xs text-red-200
                                 hover:bg-red-500/20 transition-colors"
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
    </div>
  )
}
