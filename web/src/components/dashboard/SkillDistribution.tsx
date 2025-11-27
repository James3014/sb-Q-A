import { SkillStats } from '@/lib/improvement';

interface SkillDistributionProps {
    skills: SkillStats[];
}

export function SkillDistribution({ skills }: SkillDistributionProps) {
    if (skills.length === 0) {
        return (
            <div className="bg-zinc-800 rounded-lg p-4 text-center">
                <p className="text-zinc-400 text-sm">🎯 尚未有技能分類資料</p>
                <p className="text-xs text-zinc-500 mt-1">開始練習以解鎖技能雷達圖</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="font-bold text-sm mb-3">🎯 CASI 技能分布</h3>
            <div className="space-y-2">
                {skills.map(s => {
                    const isWeak = s.score < 3;
                    return (
                        <div key={s.skill}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="flex items-center gap-1">
                                    {isWeak && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                                    {s.skill}
                                </span>
                                <span className={isWeak ? 'text-red-400' : ''}>{s.score.toFixed(1)} ({s.count}次)</span>
                            </div>
                            <div className="h-2 bg-zinc-700 rounded">
                                <div className={`h-2 rounded ${isWeak ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(s.score / 5) * 100}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
