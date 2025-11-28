'use client'

// 震動回饋（手套友善）
export function vibrate(pattern: number | number[] = 20) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

// 通用按鈕（含震動回饋）
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}) {
  const baseClass = 'font-semibold rounded-xl transition-all active:scale-95'
  const sizeClass = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }[size]
  const variantClass = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-zinc-700 hover:bg-zinc-600 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  }[variant]
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : ''

  const handleClick = () => {
    if (disabled) return
    vibrate(20)
    onClick?.()
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClass} ${sizeClass} ${variantClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  )
}
