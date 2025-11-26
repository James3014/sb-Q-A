'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getFavorites } from '@/lib/favorites'
import { getLessons, Lesson } from '@/lib/lessons'
import LessonCard from '@/components/LessonCard'

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const [favIds, setFavIds] = useState<string[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const load = async () => {
      const allLessons = await getLessons()
      setLessons(allLessons)
      
      if (user) {
        const ids = await getFavorites(user.id)
        setFavIds(ids)
      }
      setLoadingData(false)
    }
    
    if (!loading) load()
  }, [user, loading])

  const favLessons = lessons.filter(l => favIds.includes(l.id))

  if (loading || loadingData) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white p-4">
        <p className="text-center text-zinc-400 mt-20">載入中...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white p-4">
        <Link href="/" className="text-zinc-400 text-sm">← 返回首頁</Link>
        <p className="text-center text-zinc-400 mt-20">請先登入</p>
        <Link href="/login" className="block text-center text-blue-400 mt-4">前往登入</Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-zinc-400">←</Link>
          <h1 className="text-xl font-bold">❤️ 我的收藏</h1>
        </div>
      </header>

      <div className="p-4">
        {favLessons.length === 0 ? (
          <p className="text-center text-zinc-500 mt-10">還沒有收藏任何課程</p>
        ) : (
          <div className="space-y-3">
            {favLessons.map(lesson => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
