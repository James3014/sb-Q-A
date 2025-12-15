'use client'

interface ChipOption {
  label: string
  value: string
}

interface ChipInputProps {
  label?: string
  value: string[]
  options: ChipOption[]
  onChange: (next: string[]) => void
  error?: string
}

export function ChipInput({ label, value, options, onChange, error }: ChipInputProps) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter(item => item !== tag))
    } else {
      onChange([...value, tag])
    }
  }

  return (
    <div className="space-y-2">
      {label && <span className="text-sm font-semibold text-white">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const active = value.includes(option.value)
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => toggle(option.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${active ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
