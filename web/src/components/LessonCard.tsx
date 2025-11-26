import Link from 'next/link';
import { Lesson } from '@/lib/lessons';

const levelMap: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '進階',
};

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const levels = lesson.level_tags.map(t => levelMap[t] || t).join('/');
  
  return (
    <Link href={`/lesson/${lesson.id}`}>
      <div className="bg-zinc-800 rounded-xl p-4 hover:bg-zinc-750 active:bg-zinc-700 transition-colors relative">
        {lesson.is_premium && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-600 text-xs rounded-full">👑</span>
        )}
        <p className="text-zinc-300 text-sm line-clamp-2 mb-2">
          😰 {lesson.what.slice(0, 80)}{lesson.what.length > 80 ? '...' : ''}
        </p>
        <h3 className="font-medium text-white mb-2">{lesson.title}</h3>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-0.5 bg-zinc-700 rounded text-zinc-300">{levels}</span>
          <span className="px-2 py-0.5 bg-zinc-700 rounded text-zinc-300">
            {lesson.casi?.Primary_Skill || '技能'}
          </span>
        </div>
      </div>
    </Link>
  );
}
