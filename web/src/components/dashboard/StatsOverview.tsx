'use client'

import { ImprovementData } from '@/lib/improvement';
import { motion } from 'framer-motion';

interface StatsOverviewProps {
    data: ImprovementData;
}

export function StatsOverview({ data }: StatsOverviewProps) {
    const averageScore = data.scores.length > 0
        ? (data.scores.reduce((a, s) => a + s.score, 0) / data.scores.length).toFixed(1)
        : '-';

    return (
        <div className="grid grid-cols-3 gap-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-lg p-3 text-center hover:bg-zinc-800/50 transition-colors"
            >
                <p className="text-zinc-400 text-xs mb-1">總練習</p>
                <p className="text-2xl font-bold text-white">{data.totalPractices}</p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-lg p-3 text-center hover:bg-zinc-800/50 transition-colors"
            >
                <p className="text-zinc-400 text-xs mb-1">技能數</p>
                <p className="text-2xl font-bold text-white">{data.skills.length}</p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-lg p-3 text-center hover:bg-zinc-800/50 transition-colors"
            >
                <p className="text-zinc-400 text-xs mb-1">平均分</p>
                <p className="text-2xl font-bold text-brand-red">{averageScore}</p>
            </motion.div>
        </div>
    );
}
