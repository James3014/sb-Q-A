import { TrendStats } from '@/lib/improvement';

interface PracticeTrendProps {
    trend: TrendStats[];
    trendDays: 7 | 30;
    setTrendDays: (days: 7 | 30) => void;
}

export function PracticeTrend({ trend, trendDays, setTrendDays }: PracticeTrendProps) {
    const filteredTrend = trendDays === 7 ? trend.slice(-7) : trend;

    return (
        <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm">📊 練習趨勢</h3>
                <div className="flex gap-1">
                    <button onClick={() => setTrendDays(7)} className={`px-2 py-1 text-xs rounded ${trendDays === 7 ? 'bg-blue-600' : 'bg-zinc-700'}`}>7天</button>
                    <button onClick={() => setTrendDays(30)} className={`px-2 py-1 text-xs rounded ${trendDays === 30 ? 'bg-blue-600' : 'bg-zinc-700'}`}>30天</button>
                </div>
            </div>
            {filteredTrend.length > 0 ? (
                <>
                    <div className="flex items-end gap-1 h-20">
                        {filteredTrend.map(t => {
                            const max = Math.max(...filteredTrend.map(x => x.count), 1);
                            const height = (t.count / max) * 100;
                            return (
                                <div key={t.date} className="flex-1">
                                    <div className="w-full bg-green-500 rounded-t" style={{ height: `${height}%`, minHeight: t.count > 0 ? '4px' : '0' }} title={`${t.date}: ${t.count}`} />
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2 text-center">共 {filteredTrend.reduce((a, t) => a + t.count, 0)} 次練習</p>
                </>
            ) : (
                <p className="text-zinc-500 text-sm text-center py-4">近期沒有練習紀錄</p>
            )}
        </div>
    );
}
