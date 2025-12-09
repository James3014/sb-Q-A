'use client'

import { useState } from 'react'
import { Lesson, getLessons, getRelatedLessons } from '@/lib/lessons'
import { useAuth } from './AuthProvider'
import { isFavorited, addFavorite, removeFavorite } from '@/lib/favorites'
import { addPracticeLog, getLessonPracticeLogs, PracticeLog, PracticeRatings } from '@/lib/practice'
import { getImprovementData, ImprovementData } from '@/lib/improvement'
import { SKILL_RECOMMENDATIONS } from '@/lib/constants'
import { useScrollDepth } from '@/hooks/useScrollDepth'
import { useLessonDetailData } from '@/hooks/useLessonDetailData'
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
  const [showPracticeModal, setShowPracticeModal] = useState(false)

  const isLocked = lesson.is_premium && !subscription.isActive
  // 已登入時顯示底部操作欄（無論是否鎖定）
  const showActions = !!user

  const {
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
  } = useLessonDetailData(lesson, user)

  // 滾動深度追蹤
  useScrollDepth(lesson.id)

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

  return (
    <main className="min-h-screen bg-zinc-900 text-white pb-24">
      <article className="max-w-lg mx-auto px-4 py-6">
        <LessonHeader skill={lesson.casi?.Primary_Skill} title={lesson.title} />
        <LessonTitle lesson={lesson} />
        
        {/* 收藏和練習快捷按鈕 - 總是顯示，引導註冊/訂閱 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              if (!user) {
                if (confirm('需要登入才能收藏課程，是否前往登入？')) {
                  window.location.href = '/login'
                }
              } else if (!subscription.isActive) {
                if (confirm('需要訂閱才能使用收藏功能，是否查看方案？')) {
                  window.location.href = '/pricing'
                }
              } else {
                toggleFavorite()
              }
            }}
            disabled={favLoading && !!user && subscription.isActive}
            className={`
              flex-1 h-12 rounded-xl
              text-sm font-bold tracking-wide
              flex items-center justify-center gap-2
              border-2 transition-all active:scale-95
              ${!user || !subscription.isActive
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                : isFav
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 text-red-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
              }
            `}
          >
            {favLoading && user && subscription.isActive ? '⏳' : isFav && user && subscription.isActive ? '❤️ 已收藏' : '🤍 收藏'}
          </button>

          <button
            onClick={() => {
              if (!user) {
                if (confirm('需要登入才能記錄練習，是否前往登入？')) {
                  window.location.href = '/login'
                }
              } else if (!subscription.isActive) {
                if (confirm('需要訂閱才能記錄練習，是否查看方案？')) {
                  window.location.href = '/pricing'
                }
              } else {
                setShowPracticeModal(true)
              }
            }}
            className="
              flex-1 h-12 rounded-xl
              text-sm font-bold tracking-wide
              flex items-center justify-center gap-2
              bg-zinc-800 border-2 border-zinc-700
              text-zinc-300 hover:border-zinc-600
              transition-all active:scale-95
            "
          >
            📝 練習紀錄
          </button>
        </div>
        
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
                  onComplete={async (note, ratings) => {
                    await completePractice(note, ratings)
                    setShowPracticeModal(false)
                  }}
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
          lessonId={lesson.id}
          isFav={isFav}
          favLoading={favLoading}
          onToggleFav={toggleFavorite}
          onShare={handleShare}
          onPractice={inlinePractice}
          showPractice={subscription.isActive}
          isCompleted={isCompletedToday}
          isLoggedIn={!!user}
          isLocked={isLocked}
        />
      )}
    </main>
  )
}
