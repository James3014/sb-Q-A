// 進度條
export function ProgressBar({ 
  value, 
  max, 
  color = 'bg-blue-500' 
}: { 
  value: number
  max: number
  color?: string 
}) {
  const percent = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="h-2 bg-zinc-700 rounded overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

// 漏斗條（含標籤）
export function FunnelBar({ 
  label, 
  value, 
  max 
}: { 
  label: string
  value: number
  max: number 
}) {
  const percent = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 bg-zinc-700 rounded">
        <div className="h-3 rounded bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

// 統計卡片
export function StatCard({ 
  label, 
  value, 
  color 
}: { 
  label: string
  value: string | number
  color?: string 
}) {
  return (
    <div className="bg-zinc-800 rounded-lg p-3 text-center">
      <p className="text-zinc-400 text-xs">{label}</p>
      <p className={`text-xl font-bold ${color || ''}`}>{value}</p>
    </div>
  )
}
