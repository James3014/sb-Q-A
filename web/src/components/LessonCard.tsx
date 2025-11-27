import Link from 'next/link';
import { Lesson } from '@/lib/lessons';
import { LEVEL_NAMES } from '@/lib/constants';

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const levels = lesson.level_tags.map(t => LEVEL_NAMES[t] || t).join('/');
  
  return (
    <Link href={`/lesson/${lesson.id}`} className="block">
      <div className="bg-zinc-800 rounded-xl p-4 hover:bg-zinc-750 active:bg-zinc-700 transition-colors">
        <p className="text-zinc-300 text-sm line-clamp-2 mb-2">
          😰 {lesson.what.slice(0, 80)}{lesson.what.length > 80 ? '...' : ''}
        </p>
        <h3 className="font-medium text-white mb-2">{lesson.title}</h3>
        <div className="flex gap-2 text-xs flex-wrap">
          {lesson.is_premium && (
            <span className="px-2 py-0.5 bg-amber-600/80 rounded text-amber-100">PRO</span>
          )}
          <span className="px-2 py-0.5 bg-zinc-700 rounded text-zinc-300">{levels}</span>
          <span className="px-2 py-0.5 bg-zinc-700 rounded text-zinc-300">
            {lesson.casi?.Primary_Skill || '技能'}
          </span>
        </div>
      </div>
    </Link>
  );
}
