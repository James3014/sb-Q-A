'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getLessonById, Lesson } from '@/lib/lessons'
import LessonDetail from '@/components/LessonDetail'
import SkeletonLesson from '@/components/SkeletonLesson'
import { trackEvent } from '@/lib/analytics'

export default function LessonPage() {
  const params = useParams()
  const id = params.id as string
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLessonById(id).then(data => {
      setLesson(data)
      setLoading(false)
      if (data) {
        const from = sessionStorage.getItem('lessonFrom') || 'direct'
        trackEvent('view_lesson', id, { from })
        sessionStorage.removeItem('lessonFrom')
      }
    })
  }, [id])

  if (loading) {
    return <SkeletonLesson />
  }

  if (!lesson) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🏔️</p>
          <h1 className="text-xl font-bold mb-2">找不到這堂課程</h1>
          <p className="text-zinc-400 mb-6">課程可能已下架或 ID 錯誤</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-lg transition-colors">
              ← 返回首頁
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return <LessonDetail lesson={lesson} />
}
