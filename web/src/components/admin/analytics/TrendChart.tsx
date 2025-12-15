'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export interface DailyTrend {
  date: string
  clicks: number
  trials: number
  conversions: number
}

export interface TrendChartProps {
  data: DailyTrend[]
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📈 趨勢分析</h3>
        <p className="text-zinc-500 text-sm">暫無趨勢數據</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">📈 趨勢分析</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#71717a"
            tick={{ fill: '#a1a1aa' }}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#eab308"
            strokeWidth={2}
            name="點擊"
            dot={{ fill: '#eab308' }}
          />
          <Line
            type="monotone"
            dataKey="trials"
            stroke="#3b82f6"
            strokeWidth={2}
            name="試用"
            dot={{ fill: '#3b82f6' }}
          />
          <Line
            type="monotone"
            dataKey="conversions"
            stroke="#10b981"
            strokeWidth={2}
            name="轉換"
            dot={{ fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
