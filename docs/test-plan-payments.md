## 金流整合測試計畫

### 測試帳號
| 角色 | 說明 |
| ---- | ---- |
| `user_free@example.com` | 無訂閱，用於首次購買 |
| `user_active@example.com` | 已有 `subscription_type=pass_30` 且未到期 |
| `user_expired@example.com` | `subscription_type=pass_7` 已過期 |

> 可透過 Supabase SQL 手動調整 `users` 欄位或建立 fixture。

### 測試情境
1. **成功付款**
   - 流程：登入 → 選擇方案 → 呼叫 `POST /api/payments/checkout` → 導向金流 sandbox → 付款成功 → 等待 webhook。
   - 預期：`payments.status=active`、`provider_payment_id` 填入、`users.subscription_type` 依方案更新，並觸發 `trackEvent('purchase_success')`。

2. **付款完成前關閉頁面**
   - 流程：完成付款後不回到前端，由 webhook 獨立觸發。
   - 預期：`payments.status` 一樣從 `pending` 轉 `active`，前端若輪詢 `GET /api/payments/:id/status` 可看到最新狀態。

3. **付款失敗／逾時**
   - 模擬在金流頁取消或讓交易逾時。
   - 預期：`payments.status=failed`、`users.subscription_type` 不變、`trackEvent('purchase_failed')` 正確記錄原因。

4. **使用者點擊取消**
   - 在前端 checkout 前即取消。
   - 預期：`payments` 仍保留 `pending` 記錄，可在後台察看未完成訂單。

5. **重複通知冪等**
   - 觸發 webhook 兩次（手動重送）。
   - 預期：第二次更新不會重複寫入或改變狀態，`payments_provider_unique` 避免重複紀錄。

6. **退款/撤銷**
   - 於金流後台手動發起退款。
   - 預期：webhook 攜帶退款事件 → `payments.status=refunded`、`users.payment_status=refunded`，可視規則移除 `subscription_type`。

### 驗證清單
- [ ] `payments` 表每次交易都有對應 `user_id/plan_id`。
- [ ] `users.payment_status` 與 `subscription_type` 同步。
- [ ] analytics `event_log` 有對應事件，並同步到 user-core。
- [ ] `.env` 金鑰未曝光（檢查 git status）。
- [ ] 管理後台能看到新欄位（若需 UI）。
