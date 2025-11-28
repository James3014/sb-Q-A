import Link from 'next/link';
import { Lesson } from '@/lib/lessons';
import { LEVEL_NAMES } from '@/lib/constants';

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const levels = lesson.level_tags.map(t => LEVEL_NAMES[t] || t).join('/');
  
  return (
    <Link href={`/lesson/${lesson.id}`} className="block">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 min-h-[100px] hover:bg-zinc-750 active:bg-zinc-700 active:scale-[0.98] transition-all">
        <p className="text-zinc-300 text-base leading-relaxed line-clamp-2 mb-2">
          😰 {lesson.what.slice(0, 80)}{lesson.what.length > 80 ? '...' : ''}
        </p>
        <h3 className="font-medium text-white text-lg mb-3">{lesson.title}</h3>
        <div className="flex gap-2 text-sm flex-wrap">
          {lesson.is_premium && (
            <span className="px-2 py-1 bg-amber-600/80 rounded text-amber-100">PRO</span>
          )}
          <span className="px-2 py-1 bg-zinc-700 rounded text-zinc-300">{levels}</span>
          <span className="px-2 py-1 bg-zinc-700 rounded text-zinc-300">
            {lesson.casi?.Primary_Skill || '技能'}
          </span>
        </div>
      </div>
    </Link>
  );
}
