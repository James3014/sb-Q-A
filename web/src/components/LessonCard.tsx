import Link from 'next/link';
import { Lesson } from '@/lib/lessons';
import { LEVEL_NAMES } from '@/lib/constants';

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const levels = lesson.level_tags.map(t => LEVEL_NAMES[t] || t).join('/');
  
  return (
    <Link href={`/lesson/${lesson.id}`} className="block">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 hover:bg-zinc-750 active:bg-zinc-700 active:scale-[0.98] transition-all">
        {/* 標題放大到 20px，最多 2 行 */}
        <h3 className="text-xl font-bold text-white line-clamp-2 mb-3">
          {lesson.title}
        </h3>
        
        {/* 徽章放大到 40px 高，間距加大 */}
        <div className="flex gap-3 text-sm flex-wrap">
          {lesson.is_premium && (
            <span className="px-4 py-2 bg-amber-600/80 rounded-full text-amber-100 font-semibold">PRO</span>
          )}
          <span className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full font-semibold">{levels}</span>
          <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full font-semibold">
            {lesson.casi?.Primary_Skill || '技能'}
          </span>
        </div>
      </div>
    </Link>
  );
}
