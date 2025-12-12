import { StatCard } from '@/components/ui'
import { formatCurrency } from '@/utils/affiliateUtils'
import { UI_CONSTANTS } from '@/constants/affiliate'

interface AffiliateStatsProps {
  stats: {
    total: number
    active: number
    totalClicks: number
    totalTrials: number
    totalCommissions: number
  }
}

export const AffiliateStats = ({ stats }: AffiliateStatsProps) => {
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      <StatCard label="總合作方" value={stats.total} />
      <StatCard 
        label="啟用中" 
        value={stats.active} 
        color={UI_CONSTANTS.COLORS.SUCCESS} 
      />
      <StatCard 
        label="總點擊數" 
        value={stats.totalClicks} 
        color={UI_CONSTANTS.COLORS.WARNING} 
      />
      <StatCard 
        label="總試用數" 
        value={stats.totalTrials} 
        color={UI_CONSTANTS.COLORS.INFO} 
      />
      <StatCard 
        label="總分潤" 
        value={formatCurrency(stats.totalCommissions)} 
        color={UI_CONSTANTS.COLORS.PURPLE} 
      />
    </div>
  )
}
