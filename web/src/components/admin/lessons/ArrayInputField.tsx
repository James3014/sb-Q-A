'use client'

import { useCallback } from 'react'

interface ArrayInputFieldProps {
  label?: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  error?: string
  addLabel?: string
  emptyHint?: string
}

export function ArrayInputField({
  label,
  value,
  onChange,
  placeholder,
  error,
  addLabel = '+ 新增一行',
  emptyHint,
}: ArrayInputFieldProps) {
  const items = value.length ? value : ['']

  const updateItem = useCallback((index: number, nextValue: string) => {
    const next = [...value]
    next[index] = nextValue
    onChange(next)
  }, [onChange, value])

  const addItem = useCallback(() => {
    onChange([...value, ''])
  }, [onChange, value])

  const removeItem = useCallback(
    (index: number) => {
      onChange(value.filter((_, idx) => idx !== index))
    },
    [onChange, value]
  )

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-white">{label}</label>}
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <input
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder={placeholder}
            value={value[index] ?? ''}
            onChange={event => updateItem(index, event.target.value)}
          />
          {(value.length > 1 || (value.length > 0 && value[index])) && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded border border-red-500 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20"
            >
              刪除
            </button>
          )}
        </div>
      ))}
      {emptyHint && value.length === 0 && (
        <p className="text-xs text-zinc-500">{emptyHint}</p>
      )}
      <button
        type="button"
        onClick={addItem}
        className="text-sm text-blue-300 hover:text-blue-200"
      >
        {addLabel}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
