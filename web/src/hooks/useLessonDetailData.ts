import { useCallback, useEffect, useMemo, useState } from 'react'
import { Lesson, getLessons, getRelatedLessons } from '@/lib/lessons'
import { isFavorited, addFavorite, removeFavorite } from '@/lib/favorites'
import { addPracticeLog, getLessonPracticeLogs, PracticeLog, PracticeRatings } from '@/lib/practice'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
import { SKILL_RECOMMENDATIONS } from '@/lib/constants'
import { User } from '@supabase/supabase-js'

type RelatedLessons = {
  prerequisite: { id: string; title: string } | null
  next: { id: string; title: string } | null
  similar: { id: string; title: string }[]
}

function deriveRecommendations(
  improvement: ImprovementData | null,
  lessons: Lesson[],
  currentLessonId: string
) {
  if (!improvement || improvement.skills.length === 0) return { weakSkill: null, recommendations: [] }

  const weakest = improvement.skills.reduce((min, skill) => (skill.score < min.score ? skill : min), improvement.skills[0])
  if (weakest.score >= 4) return { weakSkill: null, recommendations: [] }

  const keywords = SKILL_RECOMMENDATIONS[weakest.skill] || []
  const recommendations = lessons
    .filter(l => l.id !== currentLessonId && keywords.some(k => l.title.includes(k) || l.what?.includes(k)))
    .slice(0, 3)
    .map(l => ({ id: l.id, title: l.title }))

  return { weakSkill: weakest.skill, recommendations }
}

export function useLessonDetailData(lesson: Lesson, user: User | null) {
  const [relatedLessons, setRelatedLessons] = useState<RelatedLessons>({ prerequisite: null, next: null, similar: [] })
  const [isFav, setIsFav] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [practiceLogs, setPracticeLogs] = useState<PracticeLog[]>([])
  const [improvementData, setImprovementData] = useState<ImprovementData | null>(null)
  const [recommendations, setRecommendations] = useState<{ id: string; title: string }[]>([])
  const [weakSkill, setWeakSkill] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isCompletedToday = useMemo(() => {
    const latest = practiceLogs[0]
    if (!latest) return false
    return new Date(latest.created_at).toDateString() === new Date().toDateString()
  }, [practiceLogs])

  useEffect(() => {
    let active = true

    getLessons().then(allLessons => {
      if (!active) return
      const related = getRelatedLessons(lesson, allLessons)
      setRelatedLessons({
        prerequisite: related.prerequisite ? { id: related.prerequisite.id, title: related.prerequisite.title } : null,
        next: related.next ? { id: related.next.id, title: related.next.title } : null,
        similar: related.similar.map(l => ({ id: l.id, title: l.title })),
      })

      if (!user) return

      getImprovementData(user.id).then(improvement => {
        if (!active) return
        setImprovementData(improvement)
        const derived = deriveRecommendations(improvement, allLessons, lesson.id)
        setWeakSkill(derived.weakSkill)
        setRecommendations(derived.recommendations)
      })
    })

    if (user) {
      isFavorited(user.id, lesson.id).then(val => {
        if (active) setIsFav(val)
      })
      getLessonPracticeLogs(user.id, lesson.id).then(logs => {
        if (active) setPracticeLogs(logs)
      })
    }

    return () => {
      active = false
    }
  }, [lesson, user])

  const refreshPracticeData = useCallback(async (userId: string) => {
    const [logs, improvement] = await Promise.all([
      getLessonPracticeLogs(userId, lesson.id),
      getImprovementData(userId),
    ])
    setPracticeLogs(logs)
    setImprovementData(improvement)
    // 推薦與弱項依賴 improvement
    const allLessons = await getLessons()
    const derived = deriveRecommendations(improvement, allLessons, lesson.id)
    setWeakSkill(derived.weakSkill)
    setRecommendations(derived.recommendations)
  }, [lesson.id])

  const toggleFavorite = useCallback(async () => {
    if (!user || favLoading) return
    setFavLoading(true)
    const result = isFav
      ? await removeFavorite(user.id, lesson.id)
      : await addFavorite(user.id, lesson.id)
    if (result.success) setIsFav(prev => !prev)
    setFavLoading(false)
  }, [favLoading, isFav, lesson.id, user])

  const completePractice = useCallback(async (note: string, ratings: PracticeRatings) => {
    if (!user) return
    setSaving(true)
    const result = await addPracticeLog(user.id, lesson.id, note, ratings)
    if (result.success) {
      await refreshPracticeData(user.id)
    }
    setSaving(false)
  }, [lesson.id, refreshPracticeData, user])

  const inlinePractice = useCallback(async (ratings: { r1: number; r2: number; r3: number }) => {
    if (!user) return
    const result = await addPracticeLog(user.id, lesson.id, '', {
      rating1: ratings.r1,
      rating2: ratings.r2,
      rating3: ratings.r3,
    })
    if (result.success) {
      await refreshPracticeData(user.id)
    }
  }, [lesson.id, refreshPracticeData, user])

  return {
    relatedLessons,
    isFav,
    favLoading,
    toggleFavorite,
    practiceLogs,
    improvementData,
    weakSkill,
    recommendations,
    saving,
    completePractice,
    inlinePractice,
    isCompletedToday,
  }
}
