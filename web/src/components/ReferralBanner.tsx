'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getSupabase } from '@/lib/supabase'

interface ReferralBannerProps {
  referralCode: string
  partnerName?: string
}

export const ReferralBanner = ({ referralCode, partnerName }: ReferralBannerProps) => {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [userStatus, setUserStatus] = useState<{
    trial_used: boolean
    hasActiveSubscription: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const displayName = partnerName || referralCode

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const supabase = getSupabase()
        if (!supabase) {
          console.error('Supabase client not available')
          setLoading(false)
          return
        }
        
        const { data, error } = await supabase
          .from('users')
          .select('trial_used, subscription_type, subscription_expires_at')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Failed to check user status:', error)
          setLoading(false)
          return
        }

        const hasActiveSubscription = data.subscription_type && 
          data.subscription_type !== 'free' &&
          data.subscription_expires_at &&
          new Date(data.subscription_expires_at) > new Date()

        setUserStatus({
          trial_used: data.trial_used || false,
          hasActiveSubscription: !!hasActiveSubscription
        })
      } catch (error) {
        console.error('Error checking user status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUserStatus()
  }, [user])

  if (dismissed || loading) return null

  // 如果用戶已經試用過或有付費訂閱，不顯示橫幅
  if (userStatus?.trial_used || userStatus?.hasActiveSubscription) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-600/30 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎿</span>
            <h3 className="font-bold text-blue-300">專屬推廣優惠</h3>
          </div>
          
          <p className="text-sm text-gray-300 mb-3">
            您透過 <span className="text-blue-400 font-medium">{displayName}</span> 的推廣連結來到這裡！
          </p>
          
          <div className="bg-blue-900/30 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400">✨</span>
              <span className="font-medium text-green-300">專屬優惠內容：</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1 ml-6">
              <li>• 免費試用 7 天完整功能</li>
              <li>• 支持推薦教練獲得分潤</li>
              <li>• 享受專業滑雪指導</li>
            </ul>
          </div>

          <div className="flex gap-3">
            {!user ? (
              <Link 
                href="/login?redirect=/pricing" 
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🎁 登入後免費試用
              </Link>
            ) : (
              <Link 
                href="/pricing" 
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                onClick={() => {
                  // 確保推廣來源被保存
                  localStorage.setItem('referral_code', referralCode)
                }}
              >
                🎁 立即免費試用
              </Link>
            )}
            <Link 
              href="#plans" 
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              查看付費方案
            </Link>
          </div>
        </div>
        
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-300 ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
