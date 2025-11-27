import Link from 'next/link';
import { SkillStats } from '@/lib/improvement';
import { Lesson } from '@/lib/lessons';
import { SKILL_RECOMMENDATIONS } from '@/lib/constants';

interface WeaknessAlertProps {
    weakSkill: SkillStats | null;
    lessons: Lesson[];
}

export function WeaknessAlert({ weakSkill, lessons }: WeaknessAlertProps) {
    if (!weakSkill || weakSkill.score >= 4) return null;

    const getRecommendedLessons = (skill: string) => {
        const keywords = SKILL_RECOMMENDATIONS[skill] || [];
        return lessons
            .filter(l => keywords.some(k => l.title.includes(k) || l.what?.includes(k)))
            .slice(0, 3);
    };

    return (
        <div className="bg-gradient-to-r from-amber-900/30 to-zinc-800 rounded-lg p-4 border border-amber-600/30">
            <h3 className="font-bold text-sm mb-2 text-amber-400">🎯 建議加強：{weakSkill.skill}</h3>
            <p className="text-xs text-zinc-400 mb-3">
                根據你的練習資料，這是目前分數最低的技能（{weakSkill.score.toFixed(1)} 分）
            </p>
            {(() => {
                const recommended = getRecommendedLessons(weakSkill.skill);
                return recommended.length > 0 ? (
                    <div className="space-y-2">
                        <p className="text-xs text-zinc-500">推薦課程：</p>
                        {recommended.map(l => (
                            <Link key={l.id} href={`/lesson/${l.id}`} className="block bg-zinc-700/50 rounded p-2 text-sm hover:bg-zinc-700 transition">
                                {l.title}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Link href="/" className="text-sm text-amber-400">瀏覽相關課程 →</Link>
                );
            })()}
        </div>
    );
}
