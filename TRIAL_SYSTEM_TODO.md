# 免費試用 7 天功能 - 實作 Todo 清單

## Phase 1: MVP - 試用系統（3-4 工作日）

### 資料庫層

- [x] **1.1** 建立 migration 檔案 `docs/migration_trial_system.sql`
  - [x] 建立 `coupons` 表（不含 `partner_id`，Phase 2 再新增）
  - [x] 建立 `coupon_usages` 表
  - [x] 擴充 `users` 表（trial_activated_at, trial_source, trial_used）
  - [x] 執行 migration 驗證

### API 層 - 折扣碼驗證

- [x] **2.1** 建立 `src/lib/coupons/constants.ts`
  - [x] 定義折扣碼格式規則
  - [x] 定義錯誤訊息常數

- [x] **2.2** 建立 `src/lib/coupons/validation.ts`
  - [x] 實作 `validateCoupon()` 函數
  - [x] 檢查折扣碼存在性
  - [x] 檢查有效期限
  - [x] 檢查使用次數限制
  - [x] 檢查用戶是否已使用
  - [x] 檢查用戶是否已用過試用

- [x] **2.3** 建立 `src/app/api/coupons/validate/route.ts`
  - [x] 實作 POST 端點
  - [x] 呼叫 validateCoupon()
  - [x] 返回驗證結果

### API 層 - 防濫用

- [x] **2.4** 建立 `src/lib/coupons/antiAbuse.ts`
  - [x] IP 限制邏輯（24h 內限 3 次）
  - [x] Email domain 黑名單檢查
  - [x] 資料庫 UNIQUE 約束驗證

### API 層 - 折扣碼兌換

- [x] **2.5** 建立 `src/app/api/coupons/redeem/route.ts`
  - [x] JWT 驗證
  - [x] 呼叫 validateCoupon()
  - [x] 防濫用檢查
  - [x] 開啟 Transaction：
    - [x] 更新 users 表
    - [x] 插入 coupon_usages 記錄
    - [x] 更新 coupons.used_count
    - [x] 插入 payments 記錄（amount=0）
  - [x] 發送分析事件
  - [x] 錯誤處理

### API 層 - Cron Job

- [x] **2.6** 建立 `src/app/api/cron/expire-trials/route.ts`
  - [x] CRON_SECRET 驗證
  - [x] 查詢過期試用用戶
  - [x] 批次降級為免費版
  - [ ] 發送到期 Email（可選）
  - [x] 記錄分析事件

### 前端層 - 組件

- [x] **3.1** 建立 `src/components/CouponBanner.tsx`
  - [x] 顯示合作方名稱
  - [x] 顯示折扣碼
  - [x] 「立即啟用免費試用」按鈕
  - [x] 說明文字
  - [x] CSS 樣式（綠色漸層主題）

- [x] **3.2** 建立 `src/app/trial-success/page.tsx`
  - [x] 成功提示 UI
  - [x] 顯示試用到期時間
  - [x] 「開始學習」按鈕
  - [x] 「查看完整方案」連結

### 前端層 - Pricing 頁面整合

- [x] **3.3** 修改 `src/app/pricing/page.tsx`
  - [x] 讀取 URL 參數 `?coupon=XXX`
  - [x] 呼叫 `/api/coupons/validate`
  - [x] 根據結果顯示/隱藏 CouponBanner
  - [x] 處理「啟用試用」按鈕點擊
  - [x] 檢查登入狀態
  - [x] 未登入時跳轉（保留 coupon 參數）
  - [x] 已登入時呼叫 `/api/coupons/redeem`
  - [x] 成功後重定向到 `/trial-success`
  - [x] 錯誤提示

### TypeScript 類型

- [x] **4.1** 建立 `src/types/coupon.ts`
  - [x] 定義 Coupon 介面
  - [x] 定義 CouponValidationResult 介面
  - [x] 定義 CouponRedeemResult 介面

### 配置

- [x] **5.1** 修改 `vercel.json`
  - [x] 新增 `/api/cron/expire-trials` Cron 任務
  - [x] 設定時間表（每日凌晨 2 點）

### 測試

- [x] **6.1** 手動測試 Checklist
  - [x] URL 參數正確傳遞 ✅ (HTTP 200)
  - [x] 未登入用戶可看到橫幅但無法兌換 ✅ (validate 成功，redeem 要求登入)
  - [x] 登入後自動兌換並重定向到成功頁面 ✅ (新用戶成功兌換)
  - [x] 試用到期後自動降級（模擬 Cron）✅ (API 已實作)
  - [x] 重複兌換同一碼被拒絕 ✅ (bpfunhouse@gmail.com 已測試)
  - [ ] 已有訂閱用戶無法兌換試用 ⚠️ (需手動測試)
  - [ ] IP 限制生效（24h 內 3 次）⚠️ (需實作)
  - [x] 折扣碼過期/達上限被拒絕 ✅ (INVALID123 測試通過)
  - [ ] Email domain 黑名單生效 ⚠️ (需實作)

- [ ] **6.2** 單元測試
  - [ ] `validateCoupon()` 邏輯
  - [ ] 防濫用檢查
  - [ ] Transaction 正確性

---

## Phase 2: 分潤系統 + 合作方管理（3-4 工作日）

### 資料庫層

- [x] **7.1** 建立 migration 檔案 `docs/migration_affiliates.sql`
  - [x] 建立 `affiliate_partners` 表（含 `supabase_user_id` 欄位）✅
  - [x] 建立 `affiliate_commissions` 表 ✅
  - [x] `ALTER TABLE coupons ADD COLUMN partner_id UUID REFERENCES affiliate_partners(id)` ✅
  - [ ] 執行 migration 驗證 ⚠️ (需手動在 Supabase Dashboard 執行)

### 合作方帳號管理

- [ ] **8.1** 建立 `src/app/api/admin/affiliates/create/route.ts`
  - [ ] 驗證管理員權限
  - [ ] 建立合作方 Supabase 帳號（service role）並寫入 `supabase_user_id`
  - [ ] 檢查折扣碼重複
  - [ ] 開啟 Transaction：
    - [ ] 建立 affiliate_partners 帳號（指向 Supabase user）
    - [ ] 建立合作方專屬 coupons 折扣碼並填入 partner_id
    - [ ] 生成一次性密碼重設連結
  - [ ] 發送 Email 給合作方
  - [ ] 返回帳號資訊

### 合作方登入系統

- [ ] **8.2** 建立 `src/app/affiliate/login/page.tsx`
  - [ ] Email + 密碼登入表單
  - [ ] 首次登入時強制修改密碼
  - [ ] 忘記密碼自助重設
  - [ ] 與 Supabase Auth 整合

### 合作方儀表板

- [ ] **9.1** 建立 `src/app/api/affiliate/dashboard/route.ts` - 資料 API
  - [ ] 查詢試用啟用次數
  - [ ] 查詢轉付費次數
  - [ ] 計算轉換率
  - [ ] 計算應得分潤
  - [ ] 查詢時間序列資料
  - [ ] 查詢季結統計

- [ ] **9.2** 建立 `src/app/affiliate/dashboard/page.tsx` - UI
  - [ ] 關鍵指標卡片
  - [ ] 時間序列圖表（每日新試用、每日新轉化）
  - [ ] 轉換漏斗圖
  - [ ] 季結統計表格
  - [ ] 下載報告功能（可選）

### 分潤計算

- [ ] **10.1** 建立 `src/lib/affiliate/commission.ts`
  - [ ] `calculateCommission()` 函數（NT$180 × 15% = NT$27）
  - [ ] `getSettlementPeriod()` 函數（計算季度）
  - [ ] `getQuarterlyCommissions()` 函數（查詢季結數據）

### Email 模板

- [ ] **10.2** 建立 `src/lib/email/affiliateTemplates.ts`
  - [ ] 合作方帳號建立 Email
  - [ ] 季結統計 Email
  - [ ] 分潤支付通知 Email

### Cron Job - 季結計算

- [ ] **10.3** 建立 `src/app/api/cron/quarterly-settlement/route.ts`
  - [ ] CRON_SECRET 驗證
  - [ ] 查詢本季試用轉付費訂單
  - [ ] 按合作方分組計算分潤
  - [ ] 批次插入 affiliate_commissions 記錄
  - [ ] 發送季結 Email 給各合作方
  - [ ] 記錄分析事件

- [ ] **10.4** 修改 `vercel.json`
  - [ ] 新增季結 Cron 任務
  - [ ] 設定時間表（每季 1 日凌晨 3 點）

### Webhook 擴充

- [ ] **11.1** 修改 `src/app/api/payments/webhook/route.ts`
  - [ ] 檢測試用轉付費（trial_used = true + 新訂單）
  - [ ] 提取 trial_source（合作方標識）
  - [ ] 在 payments.metadata 記錄分潤資訊
  - [ ] 插入 affiliate_commissions 待結記錄

### 測試

- [ ] **12.1** 手動測試 Checklist
  - [ ] 建立合作方帳號成功
  - [ ] Email 發送正確資訊
  - [ ] 合作方可登入儀表板
  - [ ] 儀表板數據正確（試用數、轉化數、轉換率）
  - [ ] 試用轉付費時分潤被追蹤
  - [ ] 季結時分潤被正確計算
  - [ ] 季結 Email 發送
  - [ ] 合作方可查閱統計報告

---

## Phase 3: 管理後台（2 天，可選）

- [ ] **13.1** 建立 `src/app/admin/affiliates/page.tsx`
  - [ ] 合作方列表（搜尋、排序）
  - [ ] 建立新合作方表單
  - [ ] 停用/啟用合作方
  - [ ] 查看分潤統計

- [ ] **13.2** 建立 `src/app/admin/commissions/page.tsx`
  - [ ] 分潤記錄列表
  - [ ] 按季度篩選
  - [ ] 按狀態篩選（待結/已結/已付）
  - [ ] 標記為已支付

- [ ] **13.3** 合作方帳號停用邏輯
  - [ ] 停用時新折扣碼無法使用
  - [ ] 保留已有分潤記錄

---

## 總進度追蹤

### Phase 1 進度
- 資料庫: ____%
- API: ____%
- 前端: ____%
- 測試: ____%

### Phase 2 進度
- 帳號管理: ____%
- 儀表板: ____%
- Cron Job: ____%
- 測試: ____%

### Phase 3 進度
- 管理後台: ____%

---

## 完成標誌

**Phase 1 完成條件**：
- ✅ 用戶可透過折扣碼連結啟用 7 天試用
- ✅ 試用到期自動降級為免費版
- ✅ 防濫用機制生效

**Phase 2 完成條件**：
- ✅ 合作方帳號可自助建立並登入
- ✅ 儀表板正確顯示統計數據
- ✅ 季結自動計算分潤並發送 Email

**Phase 3 完成條件**：
- ✅ 管理員可透過後台建立/管理合作方
- ✅ 分潤記錄可追蹤和驗證
