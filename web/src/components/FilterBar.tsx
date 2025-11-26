'use client'

import { useState } from 'react'

const LEVELS = [
  { value: '', label: '全部程度' },
  { value: 'beginner', label: '初級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '進階' }
]

const SLOPES = [
  { value: '', label: '全部雪道' },
  { value: 'green', label: '綠道' },
  { value: 'blue', label: '藍道' },
  { value: 'black', label: '黑道' },
  { value: 'mogul', label: '蘑菇' },
  { value: 'powder', label: '粉雪' },
  { value: 'park', label: '公園' }
]

const SKILLS = [
  { value: '', label: '全部技能' },
  { value: '站姿與平衡', label: '站姿與平衡' },
  { value: '旋轉', label: '旋轉' },
  { value: '用刃', label: '用刃' },
  { value: '壓力', label: '壓力' },
  { value: '時機與協調性', label: '時機與協調性' }
]

interface Props {
  level: string
  slope: string
  skill: string
  onChange: (filters: { level: string; slope: string; skill: string }) => void
}

export default function FilterBar({ level, slope, skill, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-left"
      >
        {open ? '▲' : '▼'} 篩選
      </button>

      {open && (
        <div className="mt-2 p-4 rounded-lg bg-slate-800 space-y-3">
          <select
            value={level}
            onChange={e => onChange({ level: e.target.value, slope, skill })}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white"
          >
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

          <select
            value={slope}
            onChange={e => onChange({ level, slope: e.target.value, skill })}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white"
          >
            {SLOPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            value={skill}
            onChange={e => onChange({ level, slope, skill: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white"
          >
            {SKILLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <button
            onClick={() => onChange({ level: '', slope: '', skill: '' })}
            className="w-full px-3 py-2 rounded bg-slate-600 text-white"
          >
            🔄 清除篩選
          </button>
        </div>
      )}
    </div>
  )
}
