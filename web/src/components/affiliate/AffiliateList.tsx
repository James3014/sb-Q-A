import type { Affiliate } from '@/types/affiliate'
import { formatDate, formatCurrency, generateReferralLink } from '@/utils/affiliateUtils'
import { UI_CONSTANTS } from '@/constants/affiliate'

interface AffiliateListProps {
  affiliates: Affiliate[]
  expandedAffiliate: string | null
  onToggleExpanded: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
}

export const AffiliateList = ({ 
  affiliates, 
  expandedAffiliate, 
  onToggleExpanded, 
  onToggleStatus 
}: AffiliateListProps) => {
  if (affiliates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        尚無合作方資料
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {affiliates.map((affiliate) => (
        <div key={affiliate.id} className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onToggleExpanded(affiliate.id)}
                className="text-blue-400 hover:text-blue-300"
              >
                {expandedAffiliate === affiliate.id ? '▼' : '▶'}
              </button>
              
              <div>
                <h3 className="font-bold">{affiliate.partner_name}</h3>
                <p className="text-sm text-gray-400">{affiliate.contact_email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div>試用: {affiliate.total_trials}</div>
                <div>轉換: {affiliate.total_conversions}</div>
                <div>轉換率: {(affiliate.conversion_rate * 100).toFixed(1)}%</div>
                <div>分潤: {formatCurrency(affiliate.total_commissions)}</div>
              </div>

              <button
                onClick={() => onToggleStatus(affiliate.id, affiliate.is_active)}
                className={affiliate.is_active ? UI_CONSTANTS.BUTTONS.SUCCESS : UI_CONSTANTS.BUTTONS.DANGER}
              >
                {affiliate.is_active ? '啟用中' : '已停用'}
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-400">
            <div>折扣碼: <span className="text-white">{affiliate.coupon_code}</span></div>
            <div>分潤率: {(affiliate.commission_rate * 100).toFixed(0)}%</div>
            <div>推廣連結: 
              <a 
                href={generateReferralLink(affiliate.coupon_code)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 ml-1"
              >
                {generateReferralLink(affiliate.coupon_code)}
              </a>
            </div>
            <div>建立時間: {formatDate(affiliate.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
