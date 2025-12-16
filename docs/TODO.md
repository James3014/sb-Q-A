# 📋 TODO List

## 🚨 **緊急修復 (P0) - 進行中**

### 後台表單系統重構 (TDD)
- [ ] **Task 1.1**: 修復 React Error #310 - `useCallback` 依賴問題
  - [ ] 建立測試檔案 `tests/hooks/useLessonForm.test.ts`
  - [ ] 寫失敗測試 (Red)
  - [ ] 修復 useCallback 依賴 (Green)
  - [ ] 優化重構 (Refactor)
  - **問題**: 表單載入時觸發 React Error #310
  - **影響**: 後台編輯器無法正常使用
  - **詳見**: [REFACTOR_BACKEND_FORM_TDD.md](REFACTOR_BACKEND_FORM_TDD.md)

## 🔥 **核心功能 (P1) - 等待 P0**

### 後台表單架構重構
- [ ] **Task 2.1**: 抽離表單狀態管理 (`useFormState`)
- [ ] **Task 2.2**: 抽離表單動作函數 (`useFormActions`) 
- [ ] **Task 2.3**: 抽離資料載入邏輯 (`useLessonLoader`)
- [ ] **Task 2.4**: 重構為組合 Hook (`useLessonEditor`)

## ⚡ **架構優化 (P2) - 等待 P1**

### 組件職責分離
- [ ] **Task 3.1**: 組件職責分離 (`LessonFormFields`)
- [ ] **Task 3.2**: 動作按鈕組件化 (`LessonFormActions`)
- [ ] **Task 3.3**: 重構為容器組件 (`LessonForm`)

## 🛠️ **品質提升 (P3) - 等待 P2**

### 錯誤處理與效能
- [ ] **Task 4.1**: 錯誤處理統一 (`useErrorBoundary`)
- [ ] **Task 4.2**: 效能優化 (memo 化)
- [ ] **Task 4.3**: 型別安全強化

---

## ✅ **已完成功能**

### Clean Code 重構 (2025-12-16)
- [x] 統一後台頁面使用 AdminLayout（消除重複驗證邏輯）
- [x] 移除 admin/page.tsx 重複的 loading/權限檢查
- [x] 後台密碼統一用環境變數
- [x] 刪除空的 web/src/data 資料夾
- [x] admin/page.tsx 拆分子組件（StatCard、TopLessons、TopKeywords、RecentFeedback）
- [x] 拆分 ImprovementDashboard 組件（practice/page.tsx 369→100 行）
- [x] SKILL_RECOMMENDATIONS 移到 constants.ts
- [x] 拆分 LessonHeatmap 組件（admin/lessons/page.tsx 325→150 行）
- [x] 建立 formatDate() 共用函數
- [x] 訂閱方案常數 SUBSCRIPTION_PLANS 移到 constants.ts
- [x] getSubscriptionStatus() 移到 lib/subscription.ts
- [x] FunnelBar / ProgressBar / StatCard 移到 ui.tsx
- [x] admin/users 拆分 ActivationPanel 組件
- [x] FEEDBACK_TYPES 移到 constants.ts
- [x] 驗證 build ✅

### 聯盟行銷系統 (2025-12-12)
- [x] 🤝 合作方管理（聯盟行銷系統）
- [x] 💰 分潤管理（季結算/批次支付）
- [x] 📊 推廣成效分析（KPI/漏斗/排行榜/洞察）
- [x] **聯盟行銷系統 TDD 重構**
  - 巨大組件拆分：400+ 行 → 5 個專職組件
  - 業務邏輯抽離：3 個專用 Hook
  - 服務層抽象：統一 API 調用
  - 工具函數模組化：消除重複代碼
  - 型別定義統一：TypeScript 安全

### 安全性強化（2025-11-29）
- [x] 移除客戶端直連 Supabase（Admin/metrics/monetization）
- [x] Admin API 伺服器化（service key + RLS）
- [x] 客戶端 API 封裝（adminApi.ts + adminData.ts）
- [x] 前端關注點分離（頁面只負責 UI）
- [x] event_log 後端校驗/節流（rate-limit + 大小限制）
- [x] 訂閱方案版本化（DB 方案表 + 歷史保留）

### 前台功能
- [x] 課程列表與搜尋
- [x] 分類篩選（程度/雪道/技能）
- [x] 課程詳情頁
- [x] 用戶登入/註冊
- [x] 收藏功能
- [x] 練習紀錄
- [x] 付費方案頁
- [x] 意見回報

### 後台功能
- [x] Dashboard（DAU/WAU/熱門課程/搜尋/回報）
- [x] 用戶管理（搜尋/開通訂閱/註冊時間顯示）
- [x] 回報管理
- [x] 課程分析
- [x] 付費分析

---

## 🗺️ **未來規劃**

**優先開發**
- [ ] **推播提醒**
  - 即將過期提醒（7天前）
  - 新課程上線通知
  - 練習成績改善提醒

- [ ] **個人化機制**
  - 學習進度儀表板（進度條/時間統計）
  - 個人化課程推薦（基於瀏覽/練習歷史）
  - 改善計畫跟蹤（針對弱項課程自動推薦）

**未來考慮**
- [ ] 離線模式（Offline-first PWA）
- [ ] 社群功能（課程討論/經驗分享）
- [ ] 教練端平台（學生管理/進度追蹤）
- [ ] 多語言支援（中文/英文/日文）

---

## 📊 **進度總覽**

| 類別 | 完成 | 進行中 | 待開始 | 總計 |
|------|------|--------|--------|------|
| 緊急修復 (P0) | 0 | 1 | 0 | 1 |
| 核心功能 (P1) | 0 | 0 | 4 | 4 |
| 架構優化 (P2) | 0 | 0 | 3 | 3 |
| 品質提升 (P3) | 0 | 0 | 3 | 3 |
| **總計** | **0** | **1** | **10** | **11** |

**當前焦點**: 修復 React Error #310 (TDD 方式)

---

*最後更新：2025-12-16*
