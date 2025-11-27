import Link from 'next/link';
import { LEVEL_NAMES, SLOPE_NAMES } from '@/lib/constants';

interface FilterBarProps {
    levelFilter: string | null;
    slopeFilter: string | null;
    skillFilter: string | null;
    hasTagFilter: boolean;
}

export function FilterBar({ levelFilter, slopeFilter, skillFilter, hasTagFilter }: FilterBarProps) {
    if (!hasTagFilter) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-zinc-400">篩選：</span>
            {levelFilter && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-600">
                    {LEVEL_NAMES[levelFilter] || levelFilter}
                </span>
            )}
            {slopeFilter && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-600">
                    {SLOPE_NAMES[slopeFilter] || slopeFilter}
                </span>
            )}
            {skillFilter && (
                <span className="px-2 py-1 text-xs rounded-full bg-purple-600">{skillFilter}</span>
            )}
            <Link href="/" className="text-xs text-blue-400 ml-2">清除</Link>
        </div>
    );
}
