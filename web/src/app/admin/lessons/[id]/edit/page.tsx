'use client'

import { useParams, useRouter } from 'next/navigation'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { LessonForm } from '@/components/admin/lessons/LessonForm'
import { LessonPreview } from '@/components/admin/lessons/LessonPreview'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { LoadingSpinner, EmptyStateNew as EmptyState, StatusBadge } from '@/components/ui'
import { useState } from 'react'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

export default function EditLessonPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isReady } = useAdminAuth()
  const lessonId = Array.isArray(params?.id) ? params?.id[0] : params?.id

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
          {/* 分欄佈局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：編輯表單 */}
            <div className="space-y-4">
              <LessonForm
                lessonId={lessonId}
                onSuccess={() => router.push('/admin/lessons')}
              />
            </div>

            {/* 右側：即時預覽 */}
            <div className="hidden lg:block">
              <div className="sticky top-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">預覽</h2>
                  <StatusBadge variant="info" size="sm">
                    即時更新
                  </StatusBadge>
                </div>
                <LessonPreview formState={{
                  title: '',
                  what: '',
                  why: [],
                  how: [],
                  signals: { correct: [], wrong: [] },
                  level_tags: [],
                  slope_tags: [],
                  is_premium: false,
                }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}
