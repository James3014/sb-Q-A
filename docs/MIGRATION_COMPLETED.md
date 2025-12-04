# ✅ Payments Migration - 已完成

**時間**: 2025-12-04

## 已執行的變更

### 1. Enum 類型
```sql
create type public.payment_status as enum ('none', 'pending', 'active', 'failed', 'canceled', 'refunded');
```

### 2. Users 表新欄位
- `payment_status` (payment_status enum, default 'none')
- `last_payment_provider` (text)
- `last_payment_reference` (text)
- `auto_renew` (boolean, default false)

### 3. Payments 交易表
建立了包含以下欄位的 `payments` 表：
- `id` (uuid, primary key)
- `user_id` (uuid, FK → users.id)
- `plan_id` (text)
- `amount` (numeric)
- `currency` (text, default 'TWD')
- `provider` (text)
- `provider_payment_id` (text)
- `status` (payment_status enum)
- `raw_payload` (jsonb)
- `metadata` (jsonb)
- `error_message` (text)
- `created_at`, `updated_at` (timestamptz)

### 4. 索引
- `payments_user_idx` 在 `user_id`
- `payments_status_idx` 在 `status`
- `payments_provider_unique` (唯一索引，用於冪等性)

### 5. Trigger
- `set_payments_updated_at()` function
- `payments_set_updated_at` trigger（自動更新 `updated_at`）

### 6. RLS Policies
- `users_view_own_payments`: 用戶只能查看自己的 payments
- `users_cannot_insert_payments`: 用戶不能直接插入（只能透過 API）
- `service_role_all`: Service role 完全存取

## 後續步驟

### ✅ 已完成
- [x] Migration 執行
- [x] GET /api/payments/:id/status 端點
- [x] Seed data 腳本

### 🔲 待做
1. **準備測試帳號**
   ```bash
   SUPABASE_URL=https://nbstwggxfwvfruwgfcqd.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=your-key \
   node scripts/seed-payment-test-users.js
   ```

2. **決定真實金流商**（ECPay/TapPay/Stripe）

3. **實作金流 SDK 串接**
   - 在 `web/src/lib/payments.ts` 中 createCheckoutSession
   - 實作 webhook 簽章驗證

4. **測試流程**
   - Mock checkout 流程
   - Webhook 驗證
   - RLS Policy 測試

## 驗證清單

```sql
-- 驗證 enum
select typname from pg_type where typname = 'payment_status';

-- 驗證 payments 表
select tablename from pg_tables where schemaname = 'public' and tablename = 'payments';

-- 驗證 users 欄位
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'users'
and column_name in ('payment_status', 'last_payment_provider', 'last_payment_reference', 'auto_renew');

-- 驗證 RLS Policy
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public' and tablename = 'payments';
```

## 新增 API 端點

### GET /api/payments/:id/status
查詢 payment 狀態（用於前端輪詢）

**請求**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/payments/status?id=payment-uuid"
```

**回應**:
```json
{
  "id": "uuid",
  "status": "pending|active|failed|canceled|refunded",
  "planId": "pass_30",
  "amount": 599,
  "currency": "TWD",
  "provider": "mock",
  "providerPaymentId": "mock_...",
  "errorMessage": null,
  "createdAt": "2025-12-04T...",
  "updatedAt": "2025-12-04T...",
  "metadata": {...}
}
```

## 安全提醒

⚠️ **已曝露的密鑰需要重新生成**
- Supabase anon key
- Supabase service_role key

請在 Supabase Dashboard → Settings → API → Regenerate Keys
