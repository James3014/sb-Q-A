'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ReferralBannerProps {
  referralCode: string
  partnerName?: string
}

export const ReferralBanner = ({ referralCode, partnerName }: ReferralBannerProps) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const displayName = partnerName || referralCode

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
            <Link 
              href="/trial-success" 
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🎁 立即免費試用
            </Link>
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
