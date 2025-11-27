'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getFavorites } from '@/lib/favorites'
import { getLessons, Lesson } from '@/lib/lessons'
import LessonCard from '@/components/LessonCard'
import { LoadingState, LockedState, PageHeader, EmptyState } from '@/components/ui'

export default function FavoritesPage() {
  const { user, loading, subscription } = useAuth()
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

  if (loading || loadingData) return <LoadingState />

  if (!user || !subscription.isActive) {
    return <LockedState title="收藏功能為付費功能" description="升級後可收藏喜愛的課程" showLogin={!user} />
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <PageHeader title="我的收藏" emoji="❤️" />
      <div className="p-4">
        {favLessons.length === 0 ? (
          <EmptyState emoji="🤍" title="還沒有收藏任何課程" description="在課程頁點 ❤️ 即可收藏" actionText="探索課程" actionHref="/" />
        ) : (
          <div className="space-y-6">
            {favLessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)}
          </div>
        )}
      </div>
    </main>
  )
}
