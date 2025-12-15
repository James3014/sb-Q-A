/**
 * ManageView
 * 課程管理視圖 - 純展示組件
 */

import { Lesson } from '@/lib/lessons'
import { LessonManageTable } from '@/components/admin/lessons/LessonManageTable'

interface Props {
  lessons: Lesson[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onCreate: () => void
  onEdit: (id: string) => void
  onDelete: (id: string) => Promise<void>
}

export function ManageView({
  lessons,
  loading,
  error,
  onRefresh,
  onCreate,
  onEdit,
  onDelete
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">課程管理</p>
          <p className="text-sm text-zinc-500">建立 / 編輯 / 軟刪除</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onRefresh}
            className="rounded border border-zinc-600 px-3 py-1 text-sm text-zinc-100 hover:border-zinc-400"
          >
            重新整理
          </button>
          <button
            onClick={onCreate}
            className="rounded bg-emerald-500 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-400"
          >
            + 建立課程
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <LessonManageTable
        lessons={lessons}
        isLoading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}
