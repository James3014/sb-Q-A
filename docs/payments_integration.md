## 金流整合規劃 (Preparation)

> 相關 SQL 請見 `docs/migration_payments.sql`

### 1. 資料表 / 欄位變更

**新增 enum 型別與 users 欄位**
```sql
create type public.payment_status as enum ('none', 'pending', 'active', 'failed', 'canceled', 'refunded');

alter table public.users
  add column if not exists payment_status payment_status default 'none',
  add column if not exists last_payment_provider text,
  add column if not exists last_payment_reference text,
  add column if not exists auto_renew boolean default false;
```

**payments 交易表**
```sql
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id),
  plan_id text not null,
  amount numeric not null,
  currency text not null default 'TWD',
  provider text not null,
  provider_payment_id text,
  status payment_status not null default 'pending',
  raw_payload jsonb,
  error_message text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);
create index if not exists payments_provider_idx on public.payments (provider, provider_payment_id);
```

> `raw_payload` 用於保留 webhook 原始資料，`metadata` 可存內部參考（例如裝置或追蹤代碼）。

### 2. API / 流程草稿

1. 前端選擇方案 → `POST /api/payments/checkout`
   - 驗證 Supabase session；檢查是否已有有效訂閱。
   - 建立 `payments` 記錄並呼叫金流 SDK，回傳 `checkoutUrl` 或前端初始化所需 token。
2. 使用者完成付款 → 金流回傳結果給前端或 redirect。
3. 金流 `POST /api/payments/webhook`
   - 驗證簽章 → 更新 `payments.status`、`provider_payment_id`、`raw_payload`。
   - 成功時呼叫服務角色更新 `users.subscription_type` 與 `subscription_expires_at`，並將 `payment_status='active'`、`last_payment_provider/reference`。
   - 發送 `trackEvent('purchase_success' | 'purchase_failed')`，同步 user-core。
4. 前端可呼叫 `GET /api/payments/:id/status` 查詢訂單狀態，避免依賴 webhook 完成前 UI 卡住。

### 3. 環境變數

| 名稱 | 目的 |
| ---- | ---- |
| `PAYMENT_PROVIDER` | 選擇實際金流（ecpay/tappay/stripe...） |
| `PAYMENT_API_KEY` / `PAYMENT_API_SECRET` | 伺服器呼叫金流 |
| `PAYMENT_MERCHANT_ID` | 商店代號 |
| `PAYMENT_WEBHOOK_SECRET` | 驗證 webhook |
| `NEXT_PUBLIC_PAYMENT_PUBLIC_KEY` | 前端初始化（若需要） |
| `NEXT_PUBLIC_PAYMENT_PROVIDER` | 控制是否啟用 mock checkout（非 mock 時自動關閉） |

> 建議建立 `.env.local.example` 供開發者參考。

### 4. 測試案例

- 成功付款（webhook 更新 + 前端輪詢）
- 前端關閉頁面但 webhook 成功
- 付款失敗/逾時/取消
- 金流重複通知（冪等性）
- 退款或 reversed 事件
- 付費重複購買（須阻擋或提示續訂邏輯）

### 5. 追蹤與監控

- 事件：`purchase_initiated`, `purchase_success`, `purchase_failed`, `purchase_refunded`
- Metadata：`plan_id`, `amount`, `currency`, `payment_id`, `provider`, `provider_payment_id`, `reason`
- 分析：在 Supabase `event_log` 設 alerts、並透過 user-core 做交叉驗證
