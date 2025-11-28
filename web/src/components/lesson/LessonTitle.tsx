import Link from 'next/link'
import { Lesson } from '@/lib/lessons'
import { LEVEL_NAMES, SLOPE_NAMES } from '@/lib/constants'

export function LessonTitle({ lesson }: { lesson: Lesson }) {
  return (
    <div className="mb-6">
      {/* 標題區：Alpine Velocity 風格 */}
      <div className="flex items-start gap-3 mb-5">
        <h1
          className="
            flex-1
            text-3xl font-bold leading-tight
            text-gradient-velocity
            transform -skew-x-2
            line-clamp-3
          "
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {lesson.title}
        </h1>

        {/* PRO 徽章（美化版） */}
        {lesson.is_premium && (
          <span className="
            flex-shrink-0
            px-4 py-1.5
            bg-gradient-to-r from-amber-500 to-orange-500
            text-black text-xs font-bold tracking-wider
            rounded-full
            shadow-lg shadow-amber-500/30
            transform rotate-6
          ">
            PRO
          </span>
        )}
      </div>

      {/* 徽章區：斜向排列 + 漸層美化 */}
      <div className="flex flex-wrap gap-3 transform -skew-x-1">
        {/* 技能徽章 */}
        {lesson.casi?.Primary_Skill && (
          <Link
            href={`/?skill=${lesson.casi.Primary_Skill}`}
            className="
              px-5 py-2.5
              text-base font-bold tracking-wide
              rounded-lg
              bg-gradient-to-r from-purple-500/25 to-pink-500/25
              border border-purple-400/40
              text-purple-300
              backdrop-blur-sm
              hover:from-purple-500/35 hover:to-pink-500/35
              active:scale-95
              transition-all
              skew-x-1
            "
          >
            {lesson.casi.Primary_Skill}
          </Link>
        )}

        {/* 等級徽章 */}
        {lesson.level_tags?.map(t => (
          <Link
            key={t}
            href={`/?level=${t}`}
            className="
              px-5 py-2.5
              text-base font-bold tracking-wide
              rounded-lg
              bg-gradient-to-r from-orange-500/25 to-amber-500/25
              border border-orange-400/40
              text-orange-300
              backdrop-blur-sm
              hover:from-orange-500/35 hover:to-amber-500/35
              active:scale-95
              transition-all
              skew-x-1
            "
          >
            {LEVEL_NAMES[t] || t}
          </Link>
        ))}

        {/* 雪道徽章 */}
        {lesson.slope_tags?.map(t => (
          <Link
            key={t}
            href={`/?slope=${t}`}
            className="
              px-5 py-2.5
              text-base font-bold tracking-wide
              rounded-lg
              bg-gradient-to-r from-cyan-500/25 to-blue-500/25
              border border-cyan-400/40
              text-cyan-300
              backdrop-blur-sm
              hover:from-cyan-500/35 hover:to-blue-500/35
              active:scale-95
              transition-all
              skew-x-1
            "
          >
            {SLOPE_NAMES[t] || t}
          </Link>
        ))}
      </div>
    </div>
  )
}
