import Link from 'next/link'
import { Lesson } from '@/lib/lessons'
import { LEVEL_NAMES, SLOPE_NAMES } from '@/lib/constants'

export function LessonTitle({ lesson }: { lesson: Lesson }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        {lesson.is_premium && <span className="px-2 py-0.5 bg-amber-600/80 rounded text-xs">PRO</span>}
      </div>
      <div className="flex flex-wrap gap-1">
        {lesson.casi?.Primary_Skill && (
          <Link href={`/?skill=${lesson.casi.Primary_Skill}`} className="px-2 py-1 text-xs rounded-full bg-purple-600 hover:bg-purple-500">
            {lesson.casi.Primary_Skill}
          </Link>
        )}
        {lesson.level_tags?.map(t => (
          <Link key={t} href={`/?level=${t}`} className="px-2 py-1 text-xs rounded-full bg-green-600 hover:bg-green-500">
            {LEVEL_NAMES[t] || t}
          </Link>
        ))}
        {lesson.slope_tags?.map(t => (
          <Link key={t} href={`/?slope=${t}`} className="px-2 py-1 text-xs rounded-full bg-blue-600 hover:bg-blue-500">
            {SLOPE_NAMES[t] || t}
          </Link>
        ))}
      </div>
    </div>
  )
}
