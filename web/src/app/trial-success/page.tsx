'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageContainer } from '@/components/ui'
import { useAuth } from '@/components/AuthProvider'
import { getSupabase } from '@/lib/supabase'

export default function TrialSuccessPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [userStatus, setUserStatus] = useState<{
    trial_used: boolean
    subscription_type: string | null
    subscription_expires_at: string | null
  } | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    // 獲取推廣來源
    const storedReferral = localStorage.getItem('referral_code')
    setReferralCode(storedReferral)
  }, [])

  useEffect(() => {
    // 如果未登入，導向登入頁
    if (!loading && !user) {
      router.push('/login?redirect=/trial-success')
    }
  }, [user, loading, router])

  useEffect(() => {
    // 檢查用戶試用狀態
    const checkUserStatus = async () => {
      if (!user) return

      try {
        const supabase = getSupabase()
        if (!supabase) {
          console.error('Supabase client not available')
          return
        }
        
        const { data, error } = await supabase
          .from('users')
          .select('trial_used, subscription_type, subscription_expires_at')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Failed to check user status:', error)
          return
        }

        setUserStatus(data)

        // 安全檢查：如果用戶沒有試用過，不應該在這個頁面
        if (!data.trial_used) {
          console.warn('User has not used trial, redirecting to pricing')
          router.push('/pricing')
          return
        }

        // 如果用戶已經有付費訂閱，導向首頁
        const hasActiveSubscription = data.subscription_type && 
          data.subscription_type !== 'free' &&
          data.subscription_expires_at &&
          new Date(data.subscription_expires_at) > new Date()

        if (hasActiveSubscription) {
          router.push('/')
          return
        }

      } catch (error) {
        console.error('Error checking user status:', error)
      } finally {
        setStatusLoading(false)
      }
    }

    if (user) {
      checkUserStatus()
    }
  }, [user, router])

  if (loading || statusLoading) {
    return (
      <PageContainer>
        <div className="text-center py-8">載入中...</div>
      </PageContainer>
    )
  }

  if (!user || !userStatus?.trial_used) {
    return null // 會被重導向
  }

  const partnerName = referralCode?.replace('COACH-', '教練 ') || '推薦教練'

  return (
    <PageContainer>
      <div className="p-4 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">歡迎加入！</h1>
          <p className="text-gray-400">
            感謝透過 <span className="text-blue-400 font-medium">{partnerName}</span> 的推薦
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-600/30 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✨</span>
            <h2 className="text-lg font-bold text-green-300">免費試用已開通</h2>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>可使用全部 213 堂課程</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>收藏功能已解鎖</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>練習紀錄功能已開啟</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>支持您的推薦教練獲得分潤</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">🚀 開始學習</h3>
          <p className="text-sm text-gray-400 mb-4">
            建議從基礎課程開始，循序漸進提升技巧
          </p>
          
          <div className="space-y-2">
            <Link 
              href="/?level=beginner" 
              className="block bg-blue-600 hover:bg-blue-500 text-center py-3 rounded-lg font-medium transition-colors"
            >
              🔰 從初級課程開始
            </Link>
            <Link 
              href="/favorites" 
              className="block bg-gray-600 hover:bg-gray-500 text-center py-3 rounded-lg font-medium transition-colors"
            >
              ⭐ 查看收藏課程
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">
            有問題嗎？隨時可以聯繫我們
          </p>
          <Link 
            href="/feedback" 
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            💬 意見回報
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
