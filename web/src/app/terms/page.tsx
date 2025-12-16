'use client'

import Link from 'next/link'
import { PageContainer } from '@/components/ui'

export default function TermsPage() {
  return (
    <PageContainer>
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-zinc-400">←</Link>
          <h1 className="text-xl font-bold">服務條款</h1>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <div className="prose prose-invert max-w-none">
          <h2>單板教學 App 服務條款</h2>
          <p className="text-sm text-zinc-400">最後更新：2025年12月16日</p>

          <h3>1. 服務說明</h3>
          <p>本平台提供滑雪板教學內容管理系統，基於 CASI 認證教學框架，專為雪場使用設計的數位教學服務。</p>

          <h3>2. 訂閱方案</h3>
          <ul>
            <li><strong>免費版</strong>：提供 28 堂初級課程，永久免費使用</li>
            <li><strong>7天 PASS</strong>：$180，提供全部 213 堂課程，有效期 7 天</li>
            <li><strong>30天 PASS</strong>：$290，提供全部 213 堂課程，有效期 30 天</li>
            <li><strong>PRO 年費</strong>：$690，提供全部課程及未來新增內容，有效期 365 天</li>
          </ul>

          <h3>3. 付費與退費政策</h3>
          <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-4 my-4">
            <h4 className="text-amber-400 font-bold">重要聲明</h4>
            <ul className="text-amber-100">
              <li>本平台提供之內容屬於<strong>數位教學服務</strong></li>
              <li>於付款完成後即解鎖並開始提供服務</li>
              <li>由於內容於購買後即可完整使用，<strong>恕不提供退費或取消服務</strong></li>
              <li>建議您於購買前詳閱課程介紹與免費內容</li>
            </ul>
          </div>

          <h3>4. 使用規範</h3>
          <ul>
            <li>用戶應合法使用本服務，不得進行任何違法行為</li>
            <li>禁止複製、分發或商業使用平台內容</li>
            <li>禁止使用技術手段破解或繞過付費機制</li>
            <li>一個帳號僅供個人使用，不得共享</li>
          </ul>

          <h3>5. 智慧財產權</h3>
          <ul>
            <li>平台所有教學內容均受著作權保護</li>
            <li>用戶僅獲得個人學習使用權，不得轉售或分享</li>
            <li>CASI 教學框架內容遵循相關授權規範</li>
          </ul>

          <h3>6. 服務變更與終止</h3>
          <ul>
            <li>我們保留隨時修改或終止服務的權利</li>
            <li>重大變更將提前 30 天通知用戶</li>
            <li>服務終止時，已付費用戶可在剩餘期間內繼續使用</li>
          </ul>

          <h3>7. 免責聲明</h3>
          <ul>
            <li>教學內容僅供參考，實際滑雪存在風險</li>
            <li>用戶應根據自身能力謹慎練習</li>
            <li>平台不對因使用教學內容導致的任何意外負責</li>
          </ul>

          <h3>8. 聯繫方式</h3>
          <p>如有任何問題，請透過以下方式聯繫我們：</p>
          <ul>
            <li>意見回報：<Link href="/feedback" className="text-blue-400 hover:underline">平台內建回報系統</Link></li>
            <li>客服信箱：support@snowboard-app.com</li>
          </ul>

          <h3>9. 條款修改</h3>
          <p>我們保留隨時修改本條款的權利。修改後的條款將在平台上公布，繼續使用服務即表示同意修改後的條款。</p>

          <div className="bg-zinc-800 rounded-lg p-4 mt-8">
            <p className="text-sm text-zinc-400">
              使用本服務即表示您已閱讀、理解並同意遵守本服務條款。
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
