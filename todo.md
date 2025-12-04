## 💳 金流系統 - 實裝進度

### ✅ 已完成（程式層面）

#### 1. 資料庫結構
- ✅ Migration 已在 Supabase 執行
- ✅ `payment_status` enum 建立（none/pending/active/failed/canceled/refunded）
- ✅ `users` 表新增 4 欄位（payment_status, last_payment_provider, last_payment_reference, auto_renew）
- ✅ `payments` 交易表建立（含索引、trigger、RLS Policy）
- ✅ 冪等性保護：unique index on (provider, provider_payment_id)

#### 2. API 端點（已實裝）
- ✅ `POST /api/payments/checkout` - 驗證登入、檢查訂閱、建立 payment 記錄、呼叫 SDK
- ✅ `POST /api/payments/webhook` - ŌEN Tech webhook 解析、status 更新、user 訂閱同步、event 記錄
- ✅ `GET /api/payments/:id/status` - 前端輪詢查詢支付狀態
- ✅ 支付成功/失敗頁面（/payment-success, /payment-failure）

#### 3. ŌEN Tech 金流 SDK
- ✅ `web/src/lib/payments.ts` - createOenTechCheckoutSession()
- ✅ `web/src/app/api/payments/webhook/route.ts` - ŌEN Tech webhook 格式解析
- ✅ 狀態對應：charged/success → active, failed → failed, 等
- ✅ user-core 同步：queueEventSync() 已整合

#### 4. 本地驗證
- ✅ TypeScript 編譯通過
- ✅ Next.js 完整構建成功
- ✅ 代碼邏輯檢查完成

#### 5. 環境配置
- ✅ `.env` 已填入 ŌEN Tech credentials（testing 環境）
- ✅ 測試帳號建立腳本準備（seed-payment-test-users.js）

---

### 🔲 待做清單（部署測試環境前必須完成）

#### 優先級 🔴 CRITICAL（測試環境上線前）

1. **確認測試帳號已建立** ✅ 完成
   - [x] 執行 `node scripts/seed-payment-test-users.js`
   - [x] 驗證三個帳號存在：
     - user_free@test.com (subscription_type=free) ✅
     - user_pro@test.com (subscription_type=pro_yearly, 有效至 2026-12-01) ✅
     - user_expired@test.com (subscription_type=pass_7, 已過期 2025-12-03) ✅
   - [x] 所有帳號密碼：Test@123456

2. **Webhook 路由配置** ✅ 完成
   - [x] 在 ŌEN Tech CRM 後台設定 webhook endpoint：
     ```
     https://sb-qa-web.zeabur.app/api/payments/webhook
     ```
   - [x] 測試環境 URL 格式確認（非 localhost）

3. **環境變數最終檢查** ⏳ 部署時完成
   - [ ] Zeabur 部署環境已設置：
     - PAYMENT_PROVIDER=oentech
     - PAYMENT_OENTECH_API_URL=https://payment-api.testing.oen.tw
     - PAYMENT_OENTECH_TOKEN=[已設置]
     - PAYMENT_OENTECH_MERCHANT_ID=james523
   - [ ] 確認 NEXT_PUBLIC_PAYMENT_PROVIDER 未設置為 mock（允許 mock，但需 fallback）
   - [ ] .env 未洩露到 git

4. **部署到 Zeabur** ⏳ 下一步
   - [ ] git add . && git commit -m "feat: ŌEN Tech payment integration ready for QA"
   - [ ] git push
   - [ ] 在 Zeabur 設置環境變數
   - [ ] Zeabur 自動/手動部署
   - [ ] 部署後確認無構建錯誤
   - [ ] 驗證 https://sb-qa-web.zeabur.app 可正常訪問
   - [ ] 記錄部署時間

#### 優先級 🟠 HIGH（測試環境 QA 時執行）

5. **完整流程測試（依 docs/PAYMENT_TESTING_GUIDE.md）**
   - [ ] **Mock Checkout 測試**
     - 登入 user_free@test.com
     - 進 pricing → 選方案 → 購買 → 導向 /mock-checkout
     - 點「模擬付款成功」→ 檢查 webhook 觸發
     - 驗證訂閱已更新、event_log 有 purchase_success

   - [ ] **ŌEN Tech 成功交易**
     - 登入 user_free@test.com
     - 進 pricing → 購買
     - 導向真實 ŌEN Tech checkout
     - 使用卡號 4242 4242 4242 4242（金額 > 100）
     - 完成支付 → 檢查 webhook 觸發
     - 驗證 users.subscription_type 已更新、payments.status=active

   - [ ] **ŌEN Tech 失敗交易**
     - 登入 user_expired@test.com
     - 購買方案
     - 使用卡號 4012 8888 1888 8333（觸發失敗）
     - 驗證導向 /payment-failure
     - 檢查 payments.status=failed、訂閱未更新

   - [ ] **3D 驗證**
     - 使用卡號 4000 0000 0000 2503
     - 完成 3D 驗證流程
     - 驗證最終訂閱更新

   - [ ] **已訂閱用戶被擋**
     - 登入 user_pro@test.com
     - 嘗試購買 → 應顯示「已有有效方案」錯誤

   - [ ] **Webhook 重試冪等性**
     - 手動觸發同一筆交易的 webhook 兩次
     - 驗證 payments 表仍只有一筆記錄（無重複）
     - 驗證 users 訂閱無異變

6. **資料庫驗證**
   - [ ] 檢查 `payments` 表有完整交易記錄
   - [ ] 檢查 `users` 表訂閱狀態與 payments 對應
   - [ ] 檢查 `event_log` 有 purchase_initiated/success/failed 事件
   - [ ] 檢查 raw_payload 完整保存 ŌEN Tech webhook 資料

7. **User-Core 同步驗證**
   - [ ] 確認 event_log 有 purchase_success/failed/refunded 事件
   - [ ] 驗證 queueEventSync() 已呼叫（檢查代碼邏輯）
   - [ ] 測試環境 user-core 收到事件（如有監控工具）

#### 優先級 🟡 MEDIUM（正式環境前）

8. **安全性補強**
   - [ ] API rate limit 設置（Vercel 中介軟體或 middleware）
   - [ ] Webhook 簽章驗證補完（目前仍為簡化版）
   - [ ] 重新生成已曝露的 Supabase 密鑰（anon + service_role）
   - [ ] 確認 service_role key 未在前端/client 代碼引用
   - [ ] 檢查 .env.local/.env.production 未被 git 追蹤

9. **異常處理 & 重試**
   - [ ] 補完 webhook 重試邏輯（如需要）
   - [ ] 測試網路中斷時的恢復流程
   - [ ] 測試支付逾時的提示

10. **對帳與監控**
    - [ ] 建立對帳腳本（Supabase payments vs ŌEN Tech 交易報表）
    - [ ] 設定告警（失敗率、異常狀態轉換）
    - [ ] 準備客服 SOP：查詢訂閱狀態、手動更新、退款流程

#### 優先級 🔵 LOW（長期規劃）

11. **後台管理功能**
    - [ ] 後台查詢 payments 表（UI 或 SQL 工具）
    - [ ] 手動調整訂閱/退款功能
    - [ ] 交易審計日誌

12. **自動化測試**
    - [ ] 編寫 e2e 測試（Cypress/Playwright）
    - [ ] 模擬各種支付場景
    - [ ] CI/CD 流程整合

---

### 📊 當前狀態

**已就緒進行部署的部分**：
- 資料庫結構 ✓
- API 實裝 ✓
- SDK 串接 ✓
- 本地構建 ✓

**部署測試環境前需完成**：
1. 測試帳號確認
2. Webhook URL 設置
3. 環境變數配置
4. Zeabur 部署
5. 完整流程 QA

**預計時間表**：
- 測試帳號設置：5 分鐘
- Webhook/環境配置：10 分鐘
- Zeabur 部署：5-10 分鐘
- 完整 QA 測試：30-45 分鐘
- **總計：1-1.5 小時**

> 下一步：確認上述 CRITICAL 項目是否都可以進行，還是需要補充什麼資訊？
