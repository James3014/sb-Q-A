export const AFFILIATE_CONSTANTS = {
  DEFAULT_COMMISSION_RATE: 0.15,
  MIN_COMMISSION_RATE: 0.05,
  MAX_COMMISSION_RATE: 0.30,
  REFERRAL_LINK_BASE: 'https://www.snowskill.app/pricing?ref=',
} as const

export const COMMISSION_STATUS = {
  PENDING: 'pending',
  SETTLED: 'settled',
  PAID: 'paid'
} as const

export const UI_CONSTANTS = {
  COLORS: {
    SUCCESS: 'text-green-400',
    INFO: 'text-blue-400',
    WARNING: 'text-yellow-400',
    DANGER: 'text-red-400',
    PURPLE: 'text-purple-400'
  },
  BUTTONS: {
    PRIMARY: 'bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded',
    SUCCESS: 'bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm',
    DANGER: 'bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm'
  }
} as const
