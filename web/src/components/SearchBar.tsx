'use client'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="搜尋問題或關鍵字..."
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
  )
}
