'use client'

import Link from 'next/link'
import { Lesson } from '@/lib/lessons'
import { LEVEL_NAMES } from '@/lib/constants'
import { useCardAnimation } from '@/hooks/useCardAnimation'
import { ProBadge } from '@/components/ui'

interface LessonCardProps {
  lesson: Lesson
  from?: 'home' | 'search' | 'category' | 'related' | 'filter'
  showLock?: boolean
}

export default function LessonCard({ lesson, from = 'home', showLock = false }: LessonCardProps) {
  const cardRef = useCardAnimation()
  const levels = lesson.level_tags.map(t => LEVEL_NAMES[t] || t).join('/')

  const handleClick = () => {
    sessionStorage.setItem('homeScrollY', window.scrollY.toString())
    sessionStorage.setItem('lessonFrom', from)
  }

  return (
    <Link
      href={showLock ? '/pricing' : `/lesson/${lesson.id}`}
      ref={cardRef}
      onClick={handleClick}
      data-lesson-id={lesson.id}
      className={`block relative opacity-0 mb-6 pt-2 transition-all ${
        showLock ? 'opacity-75 grayscale-[30%]' : 'hover:scale-105'
      }`}
    >
      {lesson.is_premium && <ProBadge />}

      {/* 🆕 鎖定徽章 */}
      {lesson.is_premium && showLock && (
        <div className="absolute top-4 right-4 z-20
          px-3 py-1 rounded-full text-xs font-bold
          bg-gradient-to-r from-amber-500 to-orange-500
          text-zinc-900 shadow-lg shadow-amber-500/50
          transform rotate-6 pointer-events-none
        ">
          🔒 PRO
        </div>
      )}

      {/* 🆕 鎖定遮罩 */}
      {showLock && (
        <div className="absolute inset-0 bg-zinc-900/30 z-10 pointer-events-none rounded-2xl [clip-path:polygon(0_12px,12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]" />
      )}

      <div className="
        velocity-shine lesson-card-pulse relative p-6 rounded-2xl
        bg-zinc-800 border-2 transition-all duration-200
        active:scale-[0.97] active:translate-y-1
        [clip-path:polygon(0_12px,12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]
      "
      style={{ borderImage: 'linear-gradient(165deg, var(--card-border), var(--card-border)) 1' }}
      >
        {/* 左上角高光 */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent [clip-path:polygon(0_0,100%_0,0_100%)] pointer-events-none" />
        
        {/* 對角線裝飾 */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent [clip-path:polygon(100%_0,100%_100%,0_0)] pointer-events-none" />
        
        {/* 底部光暈 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />

        {/* 標題 */}
        <h3
          className="lesson-card-title text-2xl font-bold text-gradient-velocity line-clamp-2 mb-4 tracking-wide transform -skew-x-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {lesson.title}
        </h3>

        {/* 徽章 */}
        <div className="flex gap-2.5 flex-wrap transform -skew-x-2">
          <span className="px-4 py-2 bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-400/40 text-orange-300 rounded-lg text-sm font-bold tracking-wide backdrop-blur-sm skew-x-2">
            {levels}
          </span>
          <span className="px-4 py-2 bg-gradient-to-r from-purple-500/25 to-pink-500/25 border border-purple-400/40 text-purple-300 rounded-lg text-sm font-bold tracking-wide backdrop-blur-sm skew-x-2">
            {lesson.casi?.Primary_Skill || '技能'}
          </span>
        </div>

        {/* 底部速度條紋 */}
        <div className="absolute bottom-2 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rounded-full" />
      </div>
    </Link>
  )
}
