import Link from 'next/link';
import { PracticeRecord } from '@/lib/improvement';
import { formatDate } from '@/lib/constants';

interface RecentPracticeListProps {
    recentPractice: PracticeRecord[];
}

export function RecentPracticeList({ recentPractice }: RecentPracticeListProps) {
    if (!recentPractice || recentPractice.length === 0) return null;

    return (
        <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="font-bold text-sm mb-3">📅 最近練習</h3>
            <div className="space-y-2">
                {recentPractice.slice(0, 5).map((p, i) => (
                    <Link key={i} href={`/lesson/${p.lesson_id}`} className="flex justify-between items-center text-sm hover:bg-zinc-700 rounded p-2 -mx-2">
                        <span className="text-zinc-300 truncate flex-1">{p.title}</span>
                        <div className="flex items-center gap-2">
                            {p.score > 0 && <span className="text-xs">⭐{p.score}</span>}
                            <span className="text-xs text-zinc-500">{formatDate(p.date, 'short')}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
