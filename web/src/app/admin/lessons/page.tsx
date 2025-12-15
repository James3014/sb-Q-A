/**
 * Lessons Page - Page 層
 * 職責: 認證檢查、數據加載、Container 渲染
 */

'use client'

import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { useAdminLessons } from '@/hooks/useAdminLessons'
import { LessonsContainer } from '@/components/admin/lessons/LessonsContainer'

export default function LessonsPage() {
  const { isReady } = useAdminAuth()
  const {
    data,
    loading,
    error,
    visibleLessons,
    actions,
    actionLoading,
    actionError
  } = useAdminLessons()

  // 認證檢查
  if (!isReady) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="📚 課程分析" />
          <div className="p-4 text-center text-zinc-500">檢查權限中...</div>
        </main>
      </AdminLayout>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="📚 課程分析" />
          <div className="p-4 text-center">
            <p className="text-red-400 mb-4">載入失敗: {error}</p>
            <button
              onClick={actions.refresh}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              重試
            </button>
          </div>
        </main>
      </AdminLayout>
    )
  }

  // 正常渲染
  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="📚 課程分析" />
        <LessonsContainer
          data={data}
          visibleLessons={visibleLessons}
          loading={loading}
          actionLoading={actionLoading}
          actionError={actionError}
          onRefresh={actions.refresh}
          onDelete={actions.deleteLesson}
        />
      </main>
    </AdminLayout>
  )
}
