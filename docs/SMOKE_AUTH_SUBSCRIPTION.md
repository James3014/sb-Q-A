# 權限／訂閱 Smoke Tests

## 目的
- 確認 RLS/政策生效：未訂閱不可讀 premium，不能寫 favorites/practice/event_log（受限）。
- 確認 admin 例外及 server API 行為正確。

## 測試前置
- 已套用 `migration_subscription_security.sql`、`migration_event_log_guardrails.sql`。
- 具備三個帳號：`anon`（未登入）、`user_free`（未訂閱）、`user_pro`（有效訂閱）、`admin_user`（is_admin=true）。

## 測試步驟
1) 匿名訪問
   - 調用 `GET /api/lessons`（或直接 Supabase `lessons`）：只能看到非 premium。
   - 對 `/api/admin/*`：應 401。
2) 未訂閱用戶
   - premium 課程：應被 RLS 阻擋（403 或空結果）。
   - 寫 favorites/practice：應被 RLS 阻擋。
   - event_log spam：超過速率應報錯 `rate limit exceeded`。
3) 訂閱中用戶
   - premium 課程可讀。
   - favorites/practice 可寫。
   - event_log 正常（未達限）。
4) Admin
   - `/api/admin/*` 正常。
   - premium/所有資料均可讀。
5) 邊界
   - 訂閱過期（修改 `subscription_expires_at < now()`）：premium 應被阻擋。
   - metadata >4000 字元：event_log 應拒絕。

## 驗證方式（示例）
- Postman/cURL：附帶 access_token 測 API 回應碼。
- Supabase SQL：以不同 JWT role 執行 `select * from lessons where is_premium = true limit 1;` 驗證 RLS。
