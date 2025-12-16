'use client'

import { useParams, useRouter } from 'next/navigation'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { LessonForm } from '@/components/admin/lessons/LessonForm'
import { LessonPreview } from '@/components/admin/lessons/LessonPreview'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { LoadingSpinner, EmptyStateNew as EmptyState, StatusBadge } from '@/components/ui'
import { useState, useCallback } from 'react'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

const defaultFormState: UseLessonFormState = {
  title: '',
  what: '',
  why: [],
  how: [],
  signals: { correct: [], wrong: [] },
  level_tags: [],
  slope_tags: [],
  is_premium: false,
}

export default function EditLessonPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isReady } = useAdminAuth()
  const lessonId = Array.isArray(params?.id) ? params?.id[0] : params?.id

  // 表單狀態（用於即時預覽）
  const [formState, setFormState] = useState<UseLessonFormState>(defaultFormState)

  // 手機版 tab 切換
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const handleStateChange = useCallback((state: UseLessonFormState) => {
    setFormState(state)
  }, [])

  if (!lessonId) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="✏️ 編輯課程" />
          <div className="mx-auto max-w-3xl p-4">
            <EmptyState
              icon="⚠️"
              title="找不到課程 ID"
              description="請從課程列表中選擇要編輯的課程"
              action={{
                label: "返回課程列表",
                onClick: () => router.push('/admin/lessons')
              }}
            />
          </div>
        </main>
      </AdminLayout>
    )
  }

  if (!isReady) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="✏️ 編輯課程" />
          <div className="mx-auto max-w-3xl p-4">
            <LoadingSpinner text="驗證權限..." fullscreen />
          </div>
        </main>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="✏️ 編輯課程" />
        <div className="mx-auto max-w-7xl p-4">
          {/* 手機版 Tab 切換 */}
          <div className="lg:hidden mb-4">
            <div className="flex rounded-lg bg-zinc-800 p-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ✏️ 編輯
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                👁️ 預覽
              </button>
            </div>
          </div>

          {/* 分欄佈局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：編輯表單 */}
            <div className={`space-y-4 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
              <LessonForm
                lessonId={lessonId}
                onSuccess={() => router.push('/admin/lessons')}
                onStateChange={handleStateChange}
              />
            </div>

            {/* 右側：即時預覽 */}
            <div className={activeTab === 'edit' ? 'hidden lg:block' : ''}>
              <div className="lg:sticky lg:top-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">預覽</h2>
                  <StatusBadge variant="info" size="sm">
                    即時更新
                  </StatusBadge>
                </div>
                <LessonPreview formState={formState} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
