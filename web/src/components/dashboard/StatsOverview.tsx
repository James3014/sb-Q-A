import { ImprovementData } from '@/lib/improvement';

interface StatsOverviewProps {
    data: ImprovementData;
}

export function StatsOverview({ data }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-zinc-400 text-xs">總練習</p>
                <p className="text-xl font-bold">{data.totalPractices}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-zinc-400 text-xs">技能數</p>
                <p className="text-xl font-bold">{data.skills.length}</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-zinc-400 text-xs">平均分</p>
                <p className="text-xl font-bold">
                    {data.scores.length > 0
                        ? (data.scores.reduce((a, s) => a + s.score, 0) / data.scores.length).toFixed(1)
                        : '-'}
                </p>
            </div>
        </div>
    );
}
