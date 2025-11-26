import Link from 'next/link'
import { Lesson } from '@/lib/lessons'

const LEVEL_NAMES: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '進階'
}

const SLOPE_NAMES: Record<string, string> = {
  green: '綠道',
  blue: '藍道',
  black: '黑道',
  mogul: '蘑菇',
  powder: '粉雪',
  park: '公園',
  tree: '樹林',
  flat: '平地',
  all: '全地形'
}

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const what = lesson.what?.slice(0, 80) + (lesson.what?.length > 80 ? '...' : '')

  return (
    <Link href={`/lesson/${lesson.id}`}>
      <div className="bg-slate-800 rounded-xl p-4 mb-3 border-l-4 border-amber-400 active:bg-slate-700">
        <div className="text-amber-400 font-semibold mb-2 leading-relaxed">
          🎯 {what}
        </div>
        <div className="text-slate-100 mb-2">
          {lesson.title}
        </div>
        <div className="flex flex-wrap gap-1">
          {lesson.level_tags?.map(t => (
            <span key={t} className="px-2 py-1 text-xs rounded-full bg-green-600 text-white">
              {LEVEL_NAMES[t] || t}
            </span>
          ))}
          {lesson.slope_tags?.map(t => (
            <span key={t} className="px-2 py-1 text-xs rounded-full bg-blue-600 text-white">
              {SLOPE_NAMES[t] || t}
            </span>
          ))}
          {lesson.casi?.Primary_Skill && (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-600 text-white">
              {lesson.casi.Primary_Skill}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
