import Link from 'next/link'
import { Lesson } from '@/lib/lessons'
import { LEVEL_NAMES, SLOPE_NAMES } from '@/lib/constants'

export function LessonTitle({ lesson }: { lesson: Lesson }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        {lesson.is_premium && <span className="px-3 py-1 bg-amber-600/80 rounded-full text-xs font-semibold">PRO</span>}
      </div>
      
      {/* 徽章放大到 40px 高，間距 12px */}
      <div className="flex flex-wrap gap-3">
        {lesson.casi?.Primary_Skill && (
          <Link 
            href={`/?skill=${lesson.casi.Primary_Skill}`} 
            className="px-5 py-2.5 text-base rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold hover:bg-purple-500/30 active:scale-95 transition-all"
          >
            {lesson.casi.Primary_Skill}
          </Link>
        )}
        {lesson.level_tags?.map(t => (
          <Link 
            key={t} 
            href={`/?level=${t}`} 
            className="px-5 py-2.5 text-base rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold hover:bg-orange-500/30 active:scale-95 transition-all"
          >
            {LEVEL_NAMES[t] || t}
          </Link>
        ))}
        {lesson.slope_tags?.map(t => (
          <Link 
            key={t} 
            href={`/?slope=${t}`} 
            className="px-5 py-2.5 text-base rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold hover:bg-cyan-500/30 active:scale-95 transition-all"
          >
            {SLOPE_NAMES[t] || t}
          </Link>
        ))}
      </div>
    </div>
  )
}
