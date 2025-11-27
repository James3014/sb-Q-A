# TODO

## 重構清單（Clean Code + Linus 原則）

- [x] 1. 統一後台頁面使用 AdminLayout（消除重複驗證邏輯）
- [x] 2. 移除 admin/page.tsx 重複的 loading/權限檢查
- [x] 3. 後台密碼統一用環境變數
- [x] 4. 刪除空的 web/src/data 資料夾
- [x] 5. admin/page.tsx 拆分子組件（StatCard、TopLessons、TopKeywords、RecentFeedback）
- [x] 6. 拆分 ImprovementDashboard 組件（practice/page.tsx 369→100 行）
- [x] 7. SKILL_RECOMMENDATIONS 移到 constants.ts
- [x] 8. 拆分 LessonHeatmap 組件（admin/lessons/page.tsx 325→150 行）
- [x] 9. 建立 formatDate() 共用函數
- [x] 10. 訂閱方案常數 SUBSCRIPTION_PLANS 移到 constants.ts
- [x] 11. getSubscriptionStatus() 移到 lib/subscription.ts
- [x] 12. FunnelBar / ProgressBar / StatCard 移到 ui.tsx
- [x] 13. admin/users 拆分 ActivationPanel 組件
- [x] 14. FEEDBACK_TYPES 移到 constants.ts
- [x] 15. 驗證 build ✅

## 第五輪重構（2025-11-27）

- [x] 16. admin/page.tsx 移除重複 StatCard，使用 ui.tsx
- [x] 17. FEEDBACK_TYPE_LABELS 移到 constants.ts
- [x] 18. 首頁 slopeFilter 使用 SLOPE_NAMES
- [x] 19. admin/page.tsx RecentFeedback 使用 formatDate
- [x] 20. admin/feedback 使用 formatDate + FEEDBACK_TYPE_LABELS
- [x] 21. 驗證 build ✅

---

## ✅ 已完成

### Clean Code 第五輪 (2025-11-27)
- [x] admin/page.tsx 移除重複 StatCard
- [x] FEEDBACK_TYPE_LABELS 常數化
- [x] 首頁 slopeFilter 使用 SLOPE_NAMES
- [x] 所有日期顯示統一使用 formatDate

### Clean Code 第四輪 (2025-11-27)
- [x] formatDate() 共用日期格式化函數
- [x] SUBSCRIPTION_PLANS 訂閱方案常數
- [x] FEEDBACK_TYPES 回報類型常數
- [x] getSubscriptionStatus() 訂閱狀態函數
- [x] calculateExpiryDate() 到期日計算
- [x] ProgressBar / FunnelBar / StatCard 共用組件
- [x] ActivationPanel 開通面板組件
- [x] admin/users 205→95 行
- [x] admin/monetization 移除內嵌 FunnelBar

### Clean Code 第三輪 (2025-11-27)
- [x] ImprovementDashboard 拆成獨立組件
- [x] LessonHeatmap 拆成獨立組件
- [x] SKILL_RECOMMENDATIONS 移到 constants.ts
- [x] practice/page.tsx 369→100 行
- [x] admin/lessons/page.tsx 325→150 行

### Clean Code 第二輪 (2025-11-27)
- [x] 5 個 admin 頁面統一使用 AdminLayout + AdminHeader
- [x] 移除所有重複的權限驗證邏輯（約 -150 行）
- [x] useAdminAuth hook 統一管理驗證狀態
- [x] 環境變數 NEXT_PUBLIC_ADMIN_PASSWORD
- [x] admin/page.tsx 拆分 4 個子組件

### 後台 Dashboard
- [x] 總覽頁
- [x] 用戶管理（搜尋、開通）
- [x] 回報管理
- [x] 課程分析
- [x] 付費分析

### 事件追蹤
- [x] event_log 表
- [x] trackEvent 函數
- [x] 埋點完成

### Clean Code 第一輪
- [x] constants.ts
- [x] ui.tsx 共用組件
- [x] useFilteredLessons hook
- [x] LessonDetail 拆分子組件
