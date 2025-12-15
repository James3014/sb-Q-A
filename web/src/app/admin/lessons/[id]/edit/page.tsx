'use client'

import { useParams, useRouter } from 'next/navigation'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { LessonForm } from '@/components/admin/lessons/LessonForm'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { LoadingSpinner, EmptyStateNew as EmptyState } from '@/components/ui'

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
        <div className="mx-auto max-w-3xl p-4">
          <LessonForm
            lessonId={lessonId}
            onSuccess={() => router.push('/admin/lessons')}
          />
        </div>
      </main>
    </AdminLayout>
  )
}
