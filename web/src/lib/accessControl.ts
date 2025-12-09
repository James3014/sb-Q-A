import { User } from '@supabase/supabase-js'
import { Subscription } from './subscription'

export function handleProtectedFeatureClick(
  featureName: string,
  user: User | null,
  subscription: Subscription,
  onSuccess?: () => void
) {
  if (!user) {
    if (confirm(`需要登入才能使用${featureName}功能，是否前往登入？`)) {
      window.location.href = '/login'
    }
    return
  }
  
  if (!subscription.isActive) {
    if (confirm(`需要訂閱才能使用${featureName}功能，是否查看方案？`)) {
      window.location.href = '/pricing'
    }
    return
  }
  
  onSuccess?.()
}
