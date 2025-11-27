import { TrendStats } from '@/lib/improvement';
import { motion } from 'framer-motion';

interface PracticeTrendProps {
    trend: TrendStats[];
    trendDays: 7 | 30;
    setTrendDays: (days: 7 | 30) => void;
}

export function PracticeTrend({ trend, trendDays, setTrendDays }: PracticeTrendProps) {
    const filteredTrend = trendDays === 7 ? trend.slice(-7) : trend;

    return (
        <div className="glass-panel rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-white">📊 練習趨勢</h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => setTrendDays(7)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${trendDays === 7 ? 'bg-brand-red text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        7天
                    </button>
                    <button
                        onClick={() => setTrendDays(30)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${trendDays === 30 ? 'bg-brand-red text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                    >
                        30天
                    </button>
                </div>
            </div>
            {filteredTrend.length > 0 ? (
                <>
                    <div className="flex items-end gap-1 h-20">
                        {filteredTrend.map((t, index) => {
                            const max = Math.max(...filteredTrend.map(x => x.count), 1);
                            const height = (t.count / max) * 100;
                            return (
                                <div key={t.date} className="flex-1 group relative">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="w-full bg-gradient-to-t from-red-900 to-brand-red rounded-t opacity-80 group-hover:opacity-100 transition-opacity"
                                        style={{ minHeight: t.count > 0 ? '4px' : '0' }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                                        <div className="bg-zinc-900 text-xs text-white px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                                            {t.date}: {t.count}次
                                        </div>
                                    </div>
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
