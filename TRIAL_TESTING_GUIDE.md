# 🧪 試用系統測試指南

## 1. 建立測試折扣碼

在 Supabase SQL Editor 執行：
```sql
INSERT INTO coupons (code, trial_days, expires_at, is_active, created_at) VALUES
('TESTCODE', 7, '2025-12-31 23:59:59+00', true, now()),
('TRIAL2025', 14, '2025-12-31 23:59:59+00', true, now()),
('EXPIRED', 7, '2024-12-31 23:59:59+00', true, now()),
('INACTIVE', 7, '2025-12-31 23:59:59+00', false, now());
```

## 2. 測試場景

### 場景 1: 未登入用戶
1. 訪問 `https://www.snowskill.app/pricing?coupon=TESTCODE`
2. **預期結果**: 顯示折扣碼橫幅，提示需要登入
3. **檢查**: Banner 顯示 "使用折扣碼 TESTCODE 免費體驗 7 天"

### 場景 2: 登入用戶首次使用
1. 登入帳號（確保是免費用戶且未使用過試用）
2. 訪問 `https://www.snowskill.app/pricing?coupon=TESTCODE`
3. **預期結果**: 自動兌換成功，跳轉到 `/trial-success`
4. **檢查**: 
   - 用戶 `subscription_type` 變為 `trial`
   - `subscription_expires_at` 設為 7 天後
   - `trial_used_at` 記錄當前時間

### 場景 3: 重複使用折扣碼
1. 同一用戶再次訪問 `https://www.snowskill.app/pricing?coupon=TESTCODE`
2. **預期結果**: 顯示 "此折扣碼已被使用"
3. **檢查**: 不會重複啟用試用

### 場景 4: 無效折扣碼
1. 訪問 `https://www.snowskill.app/pricing?coupon=INVALID`
2. **預期結果**: 顯示 "折扣碼無效或已過期"

### 場景 5: 過期折扣碼
1. 訪問 `https://www.snowskill.app/pricing?coupon=EXPIRED`
2. **預期結果**: 顯示 "折扣碼無效或已過期"

### 場景 6: 非活躍折扣碼
1. 訪問 `https://www.snowskill.app/pricing?coupon=INACTIVE`
2. **預期結果**: 顯示 "折扣碼無效或已過期"

## 3. API 直接測試

### 驗證折扣碼 API
```bash
curl -X POST https://www.snowskill.app/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"couponCode": "TESTCODE"}'
```

**預期響應**:
```json
{
  "valid": true,
  "coupon": {
    "code": "TESTCODE",
    "trial_days": 7
  }
}
```

### 兌換折扣碼 API（需要登入）
```bash
curl -X POST https://www.snowskill.app/api/coupons/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"couponCode": "TESTCODE"}'
```

## 4. 資料庫檢查

### 檢查用戶狀態
```sql
SELECT id, email, subscription_type, subscription_expires_at, trial_used_at 
FROM users 
WHERE email = 'your-test-email@example.com';
```

### 檢查折扣碼使用記錄
```sql
SELECT * FROM coupon_usages 
WHERE user_id = 'your-user-id' 
ORDER BY used_at DESC;
```

### 檢查事件日誌
```sql
SELECT event_type, metadata 
FROM event_log 
WHERE user_id = 'your-user-id' 
AND event_type = 'trial_activated'
ORDER BY created_at DESC;
```

## 5. Cron 任務測試

### 設定環境變數
在 Vercel 設定 `CRON_SECRET=your-secret-key`

### 測試過期處理
```bash
curl -X POST https://www.snowskill.app/api/cron/expire-trials \
  -H "Authorization: Bearer your-secret-key"
```

**預期響應**:
```json
{
  "success": true,
  "processed": 0,
  "errors": 0,
  "timestamp": "2025-12-12T11:23:00.000Z"
}
```

## 6. 測試檢查清單

- [ ] 未登入用戶看到提示橫幅
- [ ] 登入用戶成功兌換試用
- [ ] 重複使用被拒絕
- [ ] 無效折扣碼被拒絕
- [ ] 過期折扣碼被拒絕
- [ ] 非活躍折扣碼被拒絕
- [ ] 資料庫正確記錄用戶狀態
- [ ] 事件日誌正確記錄
- [ ] Cron 任務正常執行

## 7. 故障排除

### 常見問題
1. **折扣碼不生效**: 檢查資料庫中折扣碼是否存在且 `is_active = true`
2. **兌換失敗**: 檢查用戶是否已有付費訂閱或已使用過試用
3. **Cron 任務失敗**: 檢查 `CRON_SECRET` 環境變數是否正確設定

### 日誌檢查
在 Vercel Dashboard 查看 Function Logs，搜尋：
- `coupon validation`
- `trial activation`
- `cron expire-trials`
