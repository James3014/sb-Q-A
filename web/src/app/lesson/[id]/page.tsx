'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getLessonById, Lesson } from '@/lib/lessons'
import LessonDetail from '@/components/LessonDetail'

export default function LessonPage() {
  const params = useParams()
  const id = params.id as string
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLessonById(id).then(data => {
      setLesson(data)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">載入中...</p>
      </main>
    )
  }

  if (!lesson) {
    return (
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">找不到課程</p>
      </main>
    )
  }

  return <LessonDetail lesson={lesson} />
}
