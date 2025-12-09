'use client'

import { useState } from 'react'
import { vibrate } from '@/components/ui'
import { InlinePracticeCard } from '@/components/practice/InlinePracticeCard'
import { trackEvent } from '@/lib/analytics'

interface Props {
  lessonId: string
  isFav: boolean
  favLoading: boolean
  onToggleFav: () => void
  onShare: () => void
  onPractice: (ratings: { r1: number; r2: number; r3: number }) => Promise<void>
  showPractice: boolean
  isCompleted?: boolean
  isLoggedIn?: boolean
  isLocked?: boolean
}

export function BottomActionBar({
  lessonId,
  isFav,
  favLoading,
  onToggleFav,
  onShare,
  onPractice,
  showPractice,
  isCompleted,
  isLoggedIn = true,
  isLocked = false
}: Props) {
  const [showCard, setShowCard] = useState(false)

  const handleFav = () => {
    vibrate(20)
    onToggleFav()
  }

  const handleShare = () => {
    vibrate(20)
    onShare()
  }

  const handlePracticeClick = () => {
    vibrate([50, 30, 50])
    trackEvent('practice_start', lessonId)
    setShowCard(true)
  }

  return (
    <>
      {/* 嵌入式評分卡 */}
      {showCard && (
        <InlinePracticeCard
          onSubmit={async (ratings) => {
            await onPractice(ratings)
          }}
          onClose={() => setShowCard(false)}
        />
      )}

      {/* Alpine Velocity 底部操作欄 */}
      <div className="
        fixed bottom-0 left-0 right-0
        bg-zinc-900/95 backdrop-blur-lg
        border-t border-zinc-700
        px-4 py-3 pb-safe
        z-40
      ">
        <div className="max-w-lg mx-auto">
          {/* 次要按鈕（收藏 + 分享） */}
          <div className="flex gap-3 mb-3">
            {/* 收藏按鈕 */}
            <button
              onClick={handleFav}
              disabled={favLoading}
              className={`
                velocity-shine
                flex-1 h-12
                rounded-xl
                text-sm font-bold tracking-wide
                flex items-center justify-center gap-2
                border-2
                transition-all
                active:scale-95
                ${isFav
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 text-red-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                }
              `}
            >
              {favLoading ? '⏳' : isFav ? '❤️ 已收藏' : '🤍 收藏'}
            </button>

            {/* 分享按鈕 */}
            <button
              onClick={handleShare}
              className="
                velocity-shine
                flex-1 h-12
                rounded-xl
                bg-zinc-800 border-2 border-zinc-700
                hover:border-zinc-600
                active:scale-95
                transition-all
                text-sm font-bold tracking-wide text-zinc-300
                flex items-center justify-center gap-2
              "
            >
              📤 分享
            </button>
          </div>

          {/* 主按鈕（完成練習 或 解鎖 PRO） */}
          {isLocked ? (
            <button
              onClick={() => {
                vibrate([50, 30, 50])
                window.location.href = '/pricing'
              }}
              className="
                velocity-shine
                w-full h-14
                rounded-2xl
                font-bold text-lg tracking-wide
                transition-all
                active:scale-[0.98]
                bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30
              "
            >
              🔓 解鎖 PRO 課程
            </button>
          ) : showPractice ? (
            <button
              onClick={handlePracticeClick}
              className={`
                velocity-shine
                w-full h-14
                rounded-2xl
                font-bold text-lg tracking-wide
                transition-all
                active:scale-[0.98]
                ${isCompleted
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/40'
                }
              `}
            >
              {isCompleted ? '✓ 今天已練習' : '🏂 完成練習'}
            </button>
          ) : null}
        </div>
      </div>
    </>
  )
}
