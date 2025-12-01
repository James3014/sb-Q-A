'use client'

import { useState, useEffect } from 'react'
import { Lesson, getLessons, getRelatedLessons } from '@/lib/lessons'
import { useAuth } from './AuthProvider'
import { isFavorited, addFavorite, removeFavorite } from '@/lib/favorites'
import { addPracticeLog, getLessonPracticeLogs, PracticeLog, PracticeRatings } from '@/lib/practice'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
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
  LessonSequence,
  LessonUnlockPRO,
  BottomActionBar,
} from './lesson'

export default function LessonDetail({ lesson }: { lesson: Lesson }) {
  const { user, subscription } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPracticeModal, setShowPracticeModal] = useState(false)
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([])
  const [weakSkill, setWeakSkill] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<{ id: string; title: string }[]>([])
  const [improvementData, setImprovementData] = useState<ImprovementData | null>(null)
  const [relatedLessons, setRelatedLessons] = useState<{
    prerequisite: { id: string; title: string } | null
    next: { id: string; title: string } | null
    similar: { id: string; title: string }[]
  }>({ prerequisite: null, next: null, similar: [] })

  const isLocked = lesson.is_premium && !subscription.isActive
  const showActions = !!user && !isLocked
  const isCompletedToday = practiceLogs[0] && new Date(practiceLogs[0].created_at).toDateString() === new Date().toDateString()

  useEffect(() => {
    getLessons().then(allLessons => {
      const related = getRelatedLessons(lesson, allLessons)
      setRelatedLessons({
        prerequisite: related.prerequisite ? { id: related.prerequisite.id, title: related.prerequisite.title } : null,
        next: related.next ? { id: related.next.id, title: related.next.title } : null,
        similar: related.similar.map(l => ({ id: l.id, title: l.title }))
      })

      if (!user) return
      
      isFavorited(user.id, lesson.id).then(setIsFav)
      getLessonPracticeLogs(user.id, lesson.id).then(setPracticeLogs)
      
      getImprovementData(user.id).then(improvement => {
        setImprovementData(improvement)
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
      try { await navigator.share({ title: text, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      alert('已複製連結！')
    }
  }

  const handlePracticeComplete = async (note: string, ratings: PracticeRatings) => {
    if (!user) return
    setSaving(true)
    const result = await addPracticeLog(user.id, lesson.id, note, ratings)
    if (result.success) {
      const [logs, improvement] = await Promise.all([
        getLessonPracticeLogs(user.id, lesson.id),
        getImprovementData(user.id)
      ])
      setPracticeLogs(logs)
      setImprovementData(improvement)
    }
    setSaving(false)
    setShowPracticeModal(false)
  }

  // 嵌入式評分卡提交
  const handleInlinePractice = async (ratings: { r1: number; r2: number; r3: number }) => {
    if (!user) return
    const result = await addPracticeLog(user.id, lesson.id, '', { 
      rating1: ratings.r1, 
      rating2: ratings.r2, 
      rating3: ratings.r3 
    })
    if (result.success) {
      const [logs, improvement] = await Promise.all([
        getLessonPracticeLogs(user.id, lesson.id),
        getImprovementData(user.id)
      ])
      setPracticeLogs(logs)
      setImprovementData(improvement)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white pb-24">
      <article className="max-w-lg mx-auto px-4 py-6">
        <LessonHeader skill={lesson.casi?.Primary_Skill} title={lesson.title} />
        <LessonTitle lesson={lesson} />
        <LessonWhat what={lesson.what} />

        {isLocked ? (
          <LessonUnlockPRO />
        ) : (
          <>
            <LessonWhy why={lesson.why || []} />
            <LessonSteps steps={lesson.how || []} />
            <LessonSignals correct={lesson.signals?.correct} wrong={lesson.signals?.wrong} />

            {user && subscription.isActive && (
              <>
                <LessonPracticeCTA 
                  onComplete={handlePracticeComplete}
                  lastPractice={practiceLogs[0]}
                  saving={saving}
                  totalPractices={improvementData?.totalPractices}
                  improvement={improvementData?.improvement}
                  showModal={showPracticeModal}
                  setShowModal={setShowPracticeModal}
                />
                <LessonPracticeHistory logs={practiceLogs} />
                <LessonRecommendations weakSkill={weakSkill} recommendations={recommendations} />
              </>
            )}

            <LessonSequence 
              prerequisite={relatedLessons.prerequisite}
              next={relatedLessons.next}
              similar={relatedLessons.similar}
            />

            {(lesson.casi?.Primary_Skill || lesson.casi?.Core_Competency) && (
              <section className="bg-zinc-800 rounded-lg p-4 mb-4">
                <h2 className="font-semibold mb-2">📚 CASI 分類</h2>
                <p className="text-zinc-300 text-sm">技能：{lesson.casi.Primary_Skill}</p>
                <p className="text-zinc-300 text-sm">能力：{lesson.casi.Core_Competency}</p>
              </section>
            )}
          </>
        )}
      </article>

      {/* 底部固定操作欄 */}
      {showActions && (
        <BottomActionBar
          isFav={isFav}
          favLoading={favLoading}
          onToggleFav={handleToggleFav}
          onShare={handleShare}
          onPractice={handleInlinePractice}
          showPractice={subscription.isActive}
          isCompleted={isCompletedToday}
        />
      )}
    </main>
  )
}
