'use client'

import { useRouter } from 'next/navigation'
import { AdminLayout, AdminHeader } from '@/components/AdminLayout'
import { LessonForm } from '@/components/admin/lessons/LessonForm'
import { useAdminAuth } from '@/lib/useAdminAuth'

export default function CreateLessonPage() {
  const router = useRouter()
  const { isReady } = useAdminAuth()

  if (!isReady) {
    return (
      <AdminLayout>
        <main className="min-h-screen bg-zinc-900 text-white">
          <AdminHeader title="🆕 建立課程" />
          <div className="p-4 text-center text-sm text-zinc-400">載入中...</div>
        </main>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <main className="min-h-screen bg-zinc-900 text-white">
        <AdminHeader title="🆕 建立課程" />
        <div className="mx-auto max-w-3xl p-4">
          <LessonForm onSuccess={() => router.push('/admin/lessons')} />
        </div>
      </main>
    </AdminLayout>
  )
}
