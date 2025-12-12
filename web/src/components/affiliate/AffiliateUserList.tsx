import type { AffiliateUser } from '@/types/affiliate'
import { formatDate, getSubscriptionStatus } from '@/utils/affiliateUtils'

interface AffiliateUserListProps {
  users: AffiliateUser[]
  loading: boolean
}

export const AffiliateUserList = ({ users, loading }: AffiliateUserListProps) => {
  if (loading) {
    return (
      <div className="mt-4 p-4 bg-zinc-700 rounded">
        <div className="text-center text-gray-400">載入用戶列表中...</div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="mt-4 p-4 bg-zinc-700 rounded">
        <div className="text-center text-gray-400">此合作方尚無用戶</div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-zinc-700 rounded">
      <h4 className="font-bold mb-3">用戶列表 ({users.length})</h4>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {users.map((user) => (
          <div key={user.id} className="flex justify-between items-center p-2 bg-zinc-600 rounded text-sm">
            <div>
              <div className="font-medium">{user.email}</div>
              <div className="text-gray-400">註冊: {formatDate(user.created_at)}</div>
            </div>
            <div className="text-right">
              <div className={user.trial_used ? 'text-green-400' : 'text-gray-400'}>
                {user.trial_used ? '已試用' : '未試用'}
              </div>
              <div className="text-xs text-gray-400">
                {getSubscriptionStatus(user)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
