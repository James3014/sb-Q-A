import { ImprovementData } from '@/lib/improvement';

interface ImprovementSummaryProps {
    data: ImprovementData;
}

export function ImprovementSummary({ data }: ImprovementSummaryProps) {
    const improvementColor = data.improvement >= 0 ? 'text-green-400' : 'text-red-400';
    const improvementSign = data.improvement >= 0 ? '↑' : '↓';
    const hasEnoughData = data.totalPractices >= 6;

    return (
        <div className="bg-zinc-800 rounded-lg p-4">
            <h3 className="font-bold text-sm mb-3">📈 技能改善度</h3>
            {hasEnoughData ? (
                <>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-3xl font-bold ${improvementColor}`}>
                            {improvementSign} {Math.abs(data.improvement).toFixed(1)}
                        </span>
                        <span className="text-zinc-400 text-sm">分</span>
                    </div>
                    <p className="text-xs text-zinc-500">最近 3 次平均 - 最早 3 次平均</p>
                </>
            ) : (
                <div className="text-center py-4">
                    <p className="text-zinc-400 text-sm mb-2">尚未累積足夠資料（{data.totalPractices}/6 次）</p>
                    <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${(data.totalPractices / 6) * 100}%` }} />
                    </div>
                    <p className="text-xs text-zinc-500">完成 6 次練習後解鎖改善趨勢</p>
                </div>
            )}
        </div>
    );
}
