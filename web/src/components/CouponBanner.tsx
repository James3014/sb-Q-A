import { CouponValidationResult } from '@/types/coupon'

interface CouponBannerProps {
  coupon: NonNullable<CouponValidationResult['coupon']>
  loading?: boolean
  disabled?: boolean
  statusMessage?: string
  statusVariant?: 'success' | 'error'
  onRedeem: () => void
}

export function CouponBanner({
  coupon,
  loading = false,
  disabled = false,
  statusMessage,
  statusVariant = 'success',
  onRedeem,
}: CouponBannerProps) {
  return (
    <div className="rounded-2xl border border-emerald-400/60 bg-gradient-to-r from-emerald-900/60 via-emerald-800/40 to-zinc-900 p-4 shadow-lg shadow-emerald-900/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-emerald-200 uppercase tracking-widest">
            合作限定
          </p>
          <h3 className="text-xl font-bold text-white">{coupon.partner_name || 'Snowskill'}</h3>
          <p className="text-sm text-emerald-100/90">
            使用 <span className="font-mono tracking-widest">{coupon.code}</span> 一鍵啟用 {coupon.plan_label}
          </p>
        </div>
        <button
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-white/60 disabled:text-emerald-700/60"
          onClick={onRedeem}
          disabled={disabled || loading}
        >
          {loading ? '啟用中...' : '立即啟用'}
        </button>
      </div>

      <p className="mt-3 text-xs text-emerald-100/80">
        無需輸入信用卡。啟用後可享 {coupon.plan_label} 全部課程，期滿會自動恢復免費版。
      </p>

      {statusMessage && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            statusVariant === 'success'
              ? 'bg-emerald-700/30 text-emerald-100'
              : 'bg-red-900/40 text-red-200'
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  )
}
