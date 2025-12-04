# 💳 支付系統完整測試指南

## 📊 測試帳號

| 帳號 | 密碼 | 訂閱狀態 | 用途 |
|------|------|--------|------|
| `user_free@test.com` | `Test@123456` | 無訂閱 | 首次購買 |
| `user_pro@test.com` | `Test@123456` | pro_yearly (有效) | 已有訂閱（應被擋） |
| `user_expired@test.com` | `Test@123456` | pass_7 (已過期) | 續訂測試 |

---

## 🧪 三種方案測試

### 方案 1️⃣：Mock Checkout（本地測試）

#### 流程
1. 登入：`user_free@test.com` / `Test@123456`
2. 進 pricing 頁
3. 選方案點「購買」
4. **導向 `/mock-checkout`**
5. 點「模擬付款成功」
6. **自動觸發 webhook**
7. 導向 `/payment-success`
8. 檢查訂閱是否更新

#### 預期結果
- ✅ 導向 mock-checkout 頁面
- ✅ 點擊後 payment status 更新為 'active'
- ✅ users 表的 subscription_type 更新
- ✅ event_log 有 'purchase_success' 事件
- ✅ 重新登入後看到「已訂閱」狀態

#### 驗證 SQL
```sql
-- 檢查 payments 記錄
select id, user_id, status, provider, created_at
from public.payments
where user_id = (select id from public.users where email = 'user_free@test.com')
order by created_at desc limit 1;

-- 檢查 users 訂閱
select subscription_type, payment_status, subscription_expires_at
from public.users
where email = 'user_free@test.com';

-- 檢查事件日誌
select event_type, metadata
from public.event_log
where user_id = (select id from public.users where email = 'user_free@test.com')
and event_type like 'purchase_%'
order by created_at desc limit 1;
```

#### API 查詢狀態
```bash
curl -H "Authorization: Bearer <token>" \
  https://your-site/api/payments/<payment_id>/status
```
應回傳 `status`, `providerPaymentId`, `updatedAt` 等欄位，便於前端輪詢。

> 開發期間也可直接執行 `scripts/payments-smoke.sh <token> <payment_id> [base_url]` 取得相同結果（需安裝 `jq`）。

---

### 方案 2️⃣：ŌEN Tech 測試環境（真實金流）

#### A. 成功交易測試

**帳號**：`user_free@test.com` / `Test@123456`

1. 登入應用
2. 進 pricing 頁
3. 選方案點「購買」
4. **導向 ŌEN Tech 真實 checkout 頁面**
5. 填入測試卡號：**`4242 4242 4242 4242`**
   - 金額必須 **> 100** (才會成功)
   - 到期月日：任意未來日期
   - CVV：任意三碼
6. 點「確認付款」
7. 等待頁面導向（或手動回到應用）
8. 應進入 `/payment-success` 或自動重導首頁
9. 檢查訂閱是否更新

**預期結果**
- ✅ 成功導向 ŌEN Tech checkout 頁
- ✅ 支付完成後自動導向成功頁
- ✅ 訂閱狀態更新為該方案
- ✅ payments 表有記錄（status = 'active'）
- ✅ event_log 有 'purchase_success'

**驗證 SQL**
```sql
select id, provider, provider_payment_id, status, raw_payload, created_at
from public.payments
where user_id = (select id from public.users where email = 'user_free@test.com')
order by created_at desc limit 1;
```

---

#### B. 失敗交易測試

**帳號**：建議新建帳號或用 `user_expired@test.com`

1. 登入應用
2. 進 pricing 頁
3. 選方案點「購買」
4. 進 ŌEN Tech checkout
5. 填入測試卡號：**`4012 8888 1888 8333`**
   - 此卡號會觸發交易失敗
   - 金額：200 (> 100)
6. 點「確認付款」
7. 應導向 `/payment-failure?payment_error=...`
8. 檢查錯誤訊息是否清晰
9. 嘗試「重試」按鈕

**預期結果**
- ✅ 支付失敗後導向失敗頁
- ✅ 顯示失敗原因
- ✅ payments 表 status = 'failed'
- ✅ event_log 有 'purchase_failed'
- ✅ 訂閱未被更新（仍為原狀態）

**驗證 SQL**
```sql
select id, provider, status, error_message, created_at
from public.payments
where status = 'failed'
order by created_at desc limit 1;
```

---

#### C. 3D 驗證測試

**帳號**：`user_free@test.com` / `Test@123456`

1. 登入應用
2. 進 pricing 頁
3. 選方案點「購買」
4. 進 ŌEN Tech checkout
5. 填入測試卡號：**`4000 0000 0000 2503`** 或 **`5200 0000 0000 2151`**
   - 金額：150 (> 100)
6. 點「確認付款」
7. **會進入 3D 驗證頁面**（OTP 驗證）
8. 在測試環境中應自動通過或提示
9. 完成後導向成功頁

**預期結果**
- ✅ 顯示 3D 驗證頁面
- ✅ 通過驗證後完成交易
- ✅ 訂閱更新成功

---

#### D. 已有訂閱用戶測試（應被擋）

**帳號**：`user_pro@test.com` / `Test@123456`

1. 登入應用
2. 進 pricing 頁
3. 嘗試點任何方案的「購買」按鈕
4. **應被擋住並顯示錯誤訊息**：「目前已有有效方案」
5. 不應進入 checkout

**預期結果**
- ✅ 顯示錯誤提示
- ✅ 不會建立新的 payment 記錄
- ✅ 訂閱狀態不變

---

### 方案 3️⃣：支付成功後的 Webhook 驗證

#### 目標
驗證 ŌEN Tech 的 webhook 能正確觸發、解析、更新資料庫

#### 前置設定
需要在 **ŌEN Tech CRM 後台** 設定 webhook endpoint：

1. 進 ŌEN Tech 後台（https://test.oen.tw）
2. 進「總設定」或「Webhook 設定」
3. 設定 webhook URL：
   ```
   https://your-domain.com/api/payments/webhook
   ```
4. 或本地測試用 ngrok 轉發（如適用）

#### 測試流程

**A. 手動測試**

1. 完成真實支付（方案 2A）
2. 在 ŌEN Tech 後台找到該筆交易
3. 檢查是否已顯示「已處理」狀態
4. 查詢應用資料庫：
   ```sql
   select * from public.payments
   where provider_payment_id = 'ŌEN Tech回傳的ID';
   ```
5. 確認 status = 'active' 且 raw_payload 有完整資料

**B. Webhook 重試測試**（如 ŌEN Tech 支援）

1. 人為中斷網路或 API
2. ŌEN Tech 應自動重試（按其設定：2秒、4秒、6秒）
3. 檢查 payments 表是否只有一筆記錄（冪等性）
   ```sql
   select count(*), provider_payment_id
   from public.payments
   where provider_payment_id = 'xxx'
   group by provider_payment_id;
   -- 應該 count = 1
   ```

**C. Webhook 驗簽測試**（如有 secret key）

- 目前代碼未實裝簽章驗證（可後續補上）
- 驗證 webhook 來源確實是 ŌEN Tech

---

## 📋 測試檢查清單

### 前端檢查
- [ ] Pricing 頁面能正常載入
- [ ] 未登入時購買按鈕被禁用或提示登入
- [ ] 已有訂閱時購買按鈕被禁用或提示
- [ ] 導向 checkout 時顯示「處理中」
- [ ] 支付成功導向成功頁
- [ ] 支付失敗導向失敗頁，顯示錯誤原因
- [ ] 成功/失敗頁有「返回」和「重試」按鈕

### 後端檢查
- [ ] POST /api/payments/checkout 返回正確的 checkoutUrl
- [ ] 拒絕未登入的請求（401）
- [ ] 拒絕已有訂閱的用戶（409）
- [ ] 建立 payments 記錄（status = 'pending'）
- [ ] 記錄 event_log 'purchase_initiated' 事件

### Webhook 檢查
- [ ] POST /api/payments/webhook 能接收 ŌEN Tech 資料
- [ ] 正確解析 ŌEN Tech 格式
- [ ] 更新 payments.status 為 'active'
- [ ] 更新 users.subscription_type 和 subscription_expires_at
- [ ] 更新 users.payment_status 為 'active'
- [ ] 記錄 event_log 'purchase_success' 事件
- [ ] 支付失敗時，訂閱不被更新

### 資料一致性檢查
- [ ] payments 表有完整的交易歷史
- [ ] users.subscription_type 與 payments 的最新記錄對應
- [ ] event_log 有完整的事件序列：
  - purchase_initiated
  - purchase_success（或 purchase_failed）
- [ ] 無孤立的 payments 記錄（找不到對應 user）

---

## 🐛 測試問題回報範本

### 如何回報問題

**格式：Markdown 表格 + 詳細說明**

```markdown
## 🔴 [問題標題]

### 基本資訊
| 項目 | 值 |
|------|-----|
| 測試方案 | Mock / ŌEN Tech 成功 / ŌEN Tech 失敗 / 3D 驗證 / 已訂閱 / Webhook |
| 帳號 | user_xxx@test.com |
| 金額 | XXX |
| 預期行為 | ... |
| 實際行為 | ... |

### 錯誤訊息
```
貼上完整的錯誤訊息或控制台輸出
```

### 步驟重現
1. 登入 user_xxx@test.com
2. 進 pricing 頁
3. ...

### 資料庫狀態
執行以下 SQL 並貼出結果：
```sql
select * from public.payments
where user_id = (select id from public.users where email = 'user_xxx@test.com')
order by created_at desc limit 1;
```

### 截圖
[貼上前端畫面截圖或 error 訊息]

### 控制台輸出
[貼上 npm run dev 的終端輸出]

### 環境
- OS: [macOS/Windows/Linux]
- Browser: [Chrome/Safari/Firefox]
- Node version: [16/18/20]
```

---

## ✅ 測試完成的定義

✓ 所有三種方案都測試過了
✓ 沒有明顯的前端錯誤
✓ 資料庫記錄完整且正確
✓ Webhook 能正確更新訂閱
✓ 所有檢查清單項目都通過

---

## 🚀 測試流程建議

### 第 1 輪（15 分鐘）- Mock 測試
- [ ] Mock checkout 完整流程
- [ ] 檢查資料庫記錄

### 第 2 輪（20 分鐘）- ŌEN Tech 基礎測試
- [ ] 成功交易（卡號 4242...）
- [ ] 檢查訂閱更新
- [ ] 已訂閱用戶被擋

### 第 3 輪（15 分鐘）- ŌEN Tech 進階測試
- [ ] 失敗交易（卡號 4012...）
- [ ] 3D 驗證（卡號 4000... 或 5200...）
- [ ] Webhook 驗證

### 第 4 輪（10 分鐘）- 完整性檢查
- [ ] 執行所有檢查清單
- [ ] 驗證資料一致性

---

## 📞 有問題時

遇到問題請用上面的「回報範本」貼到對話中，我會幫你診斷！

包含：
1. 你在做什麼
2. 期望什麼
3. 實際發生什麼
4. 錯誤訊息 / 截圖
5. SQL 查詢結果
