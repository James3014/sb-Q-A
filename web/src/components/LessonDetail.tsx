'use client'

import { useState, useEffect } from 'react'
import { Lesson, getLessons } from '@/lib/lessons'
import { useAuth } from './AuthProvider'
import { isFavorited, addFavorite, removeFavorite } from '@/lib/favorites'
import { addPracticeLog, getLessonPracticeLogs, PracticeLog, PracticeRatings } from '@/lib/practice'
import { getImprovementData } from '@/lib/improvement'
import { SKILL_RECOMMENDATIONS } from '@/lib/constants'
import {
  LessonHeader,
  LessonTitle,
  LessonWhat,
  LessonWhy,
  LessonSteps,
  LessonSignals,
  LessonPracticeCTA,
  LessonPracticeHistory,
  LessonRecommendations,
  LessonUnlockPRO,
} from './lesson'

export default function LessonDetail({ lesson }: { lesson: Lesson }) {
  const { user, subscription } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([])
  const [weakSkill, setWeakSkill] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<{ id: string; title: string }[]>([])

  const isLocked = lesson.is_premium && !subscription.isActive
  const showActions = !!user && !isLocked

  // 載入收藏狀態、練習紀錄、弱項推薦
  useEffect(() => {
    if (!user) return
    
    isFavorited(user.id, lesson.id).then(setIsFav)
    getLessonPracticeLogs(user.id, lesson.id).then(setPracticeLogs)
    
    // 取得弱項推薦
    Promise.all([getImprovementData(user.id), getLessons()]).then(([improvement, allLessons]) => {
      if (improvement && improvement.skills.length > 0) {
        const weak = improvement.skills.reduce((min, s) => s.score < min.score ? s : min, improvement.skills[0])
        if (weak.score < 4) {
          setWeakSkill(weak.skill)
          const keywords = SKILL_RECOMMENDATIONS[weak.skill] || []
          const recs = allLessons
            .filter(l => l.id !== lesson.id && keywords.some(k => l.title.includes(k) || l.what?.includes(k)))
            .slice(0, 3)
            .map(l => ({ id: l.id, title: l.title }))
          setRecommendations(recs)
        }
      }
    })
  }, [user, lesson.id])

  const handleToggleFav = async () => {
    if (!user || favLoading) return
    setFavLoading(true)
    const result = isFav ? await removeFavorite(user.id, lesson.id) : await addFavorite(user.id, lesson.id)
    if (result.success) setIsFav(!isFav)
    setFavLoading(false)
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = `${lesson.title} - 單板教學`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch (e) {
        // 使用者取消分享
      }
    } else {
      // Fallback: 複製連結
      await navigator.clipboard.writeText(url)
      alert('已複製連結！')
    }
  }

  const handlePracticeComplete = async (note: string, ratings: PracticeRatings) => {
    if (!user) return
    setSaving(true)
    const result = await addPracticeLog(user.id, lesson.id, note, ratings)
    if (result.success) {
      // 重新載入練習紀錄
      const logs = await getLessonPracticeLogs(user.id, lesson.id)
      setPracticeLogs(logs)
    }
    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-lg mx-auto px-4 py-6 pb-8">
        <LessonHeader 
          isFav={isFav}
          favLoading={favLoading}
          onToggleFav={handleToggleFav}
          onShare={handleShare}
          showActions={showActions}
        />

        <LessonTitle lesson={lesson} />
        
        <LessonWhat what={lesson.what} />

        {isLocked ? (
          <LessonUnlockPRO />
        ) : (
          <>
            <LessonWhy why={lesson.why || []} />
            
            <LessonSteps steps={lesson.how || []} />
            
            <LessonSignals 
              correct={lesson.signals?.correct} 
              wrong={lesson.signals?.wrong} 
            />

            {user && subscription.isActive && (
              <>
                <LessonPracticeCTA 
                  onComplete={handlePracticeComplete}
                  lastPractice={practiceLogs[0]}
                  saving={saving}
                />
                
                <LessonPracticeHistory logs={practiceLogs} />
                
                <LessonRecommendations 
                  weakSkill={weakSkill}
                  recommendations={recommendations}
                />
              </>
            )}

            {/* CASI 資訊 */}
            {(lesson.casi?.Primary_Skill || lesson.casi?.Core_Competency) && (
              <section className="bg-zinc-800 rounded-lg p-4 mb-4">
                <h2 className="font-semibold mb-2">📚 CASI 分類</h2>
                <p className="text-zinc-300 text-sm">技能：{lesson.casi.Primary_Skill}</p>
                <p className="text-zinc-300 text-sm">能力：{lesson.casi.Core_Competency}</p>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
