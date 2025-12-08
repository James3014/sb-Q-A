# 測試指南

**創建日期**: 2025-12-08  
**狀態**: 待執行

---

## 📋 重構項目總結

### 已完成的重構

1. ✅ **useFilteredLessons** - 在複本上排序，免費優先、以 id 穩定排序
2. ✅ **LessonDetail** - 資料與副作用抽成 `useLessonDetailData` hook
3. ✅ **Supabase 共用薄層** - `supabaseClient.ts` 統一錯誤處理
4. ✅ **支付 webhook** - HMAC-SHA256 簽名驗證
5. ✅ **管理員授權** - 角色/白名單環境變數 + 共用守門人

### Build 狀態

✅ **TypeScript 編譯成功** (2025-12-08)
- 修復了 `subscription/route.ts` 的變數名稱衝突
- 所有 27 個路由編譯通過

---

## 🧪 測試建議

### 1. Admin API 授權測試

#### 環境變數設定

```bash
# .env.local
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,coach@example.com
ADMIN_EMAILS=admin@example.com,coach@example.com
NEXT_PUBLIC_ADMIN_ROLES=admin,coach
ADMIN_ROLES=admin,coach
```

#### 測試案例

**A. 未登入用戶（401）**
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Content-Type: application/json"

# 預期: 401 Unauthorized
# { "error": "Unauthorized" }
```

**B. 已登入但非管理員（403）**
```bash
# 1. 先登入一般用戶
# 2. 取得 session token
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json"

# 預期: 403 Forbidden
# { "error": "Forbidden: Admin access required" }
```

**C. 管理員用戶（200）**
```bash
# 1. 登入管理員帳號（email 在白名單中）
# 2. 取得 session token
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json"

# 預期: 200 OK
# { "dau": ..., "wau": ..., ... }
```

#### 測試所有 Admin API

- [ ] `/api/admin/dashboard` - GET
- [ ] `/api/admin/users` - GET
- [ ] `/api/admin/lessons` - GET
- [ ] `/api/admin/monetization` - GET
- [ ] `/api/admin/subscription` - POST

---

### 2. Payment Webhook 簽名驗證測試

#### 環境變數設定

```bash
# .env.local
PAYMENT_WEBHOOK_SECRET=test-secret-key-12345
```

#### 測試案例

**A. 無簽名（400）**
```bash
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.success",
    "payment_id": "test-123",
    "user_id": "user-456",
    "plan_id": "7day"
  }'

# 預期: 400 Bad Request
# { "error": "Missing signature" }
```

**B. 錯誤簽名（401）**
```bash
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: wrong-signature" \
  -d '{
    "event": "payment.success",
    "payment_id": "test-123",
    "user_id": "user-456",
    "plan_id": "7day"
  }'

# 預期: 401 Unauthorized
# { "error": "Invalid signature" }
```

**C. 正確簽名（200）**
```bash
# 生成正確簽名
PAYLOAD='{"event":"payment.success","payment_id":"test-123","user_id":"user-456","plan_id":"7day"}'
SECRET="test-secret-key-12345"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -d "$PAYLOAD"

# 預期: 200 OK
# { "ok": true }
```

**D. 冪等性測試（重複請求）**
```bash
# 使用相同的 payment_id 發送兩次
# 第一次: 200 OK
# 第二次: 200 OK (但不會重複更新訂閱)
```

#### 簽名生成腳本

```javascript
// scripts/generate-webhook-signature.js
const crypto = require('crypto')

const payload = JSON.stringify({
  event: 'payment.success',
  payment_id: 'test-123',
  user_id: 'user-456',
  plan_id: '7day'
})

const secret = 'test-secret-key-12345'
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex')

console.log('Payload:', payload)
console.log('Signature:', signature)
```

---

### 3. 前端功能測試

#### A. 課程列表排序

**測試步驟**:
1. 訪問首頁 `/`
2. 檢查課程列表順序

**預期結果**:
- 免費課程（`is_premium: false`）排在前面
- 相同類型課程按 `id` 穩定排序
- 原陣列不被修改（檢查 console 無警告）

#### B. 課程詳情頁

**測試步驟**:
1. 訪問任意課程 `/lesson/01`
2. 檢查資料載入
3. 檢查收藏/練習功能

**預期結果**:
- 使用 `useLessonDetailData` hook
- 資料載入正確
- 副作用（收藏、練習）正常運作

#### C. Admin 頁面授權

**測試步驟**:
1. 未登入訪問 `/admin`
2. 一般用戶訪問 `/admin`
3. 管理員訪問 `/admin`

**預期結果**:
- 未登入 → 重定向到 `/login`
- 一般用戶 → 顯示「無權限」
- 管理員 → 正常顯示儀表板

---

## 📝 測試檢查清單

### 環境設定
- [ ] 設定 `ADMIN_EMAILS` 和 `ADMIN_ROLES`
- [ ] 設定 `PAYMENT_WEBHOOK_SECRET`
- [ ] 重啟開發伺服器

### Admin API 測試
- [ ] 測試 401 (未登入)
- [ ] 測試 403 (非管理員)
- [ ] 測試 200 (管理員)
- [ ] 測試所有 5 個 admin API 端點

### Webhook 測試
- [ ] 測試無簽名 (400)
- [ ] 測試錯誤簽名 (401)
- [ ] 測試正確簽名 (200)
- [ ] 測試冪等性（重複請求）

### 前端測試
- [ ] 課程列表排序正確
- [ ] 課程詳情頁正常
- [ ] Admin 頁面授權正確

### Build 測試
- [x] `npm run build` 成功
- [ ] 部署到 Zeabur 成功
- [ ] 生產環境測試

---

## 🐛 已知問題

### 已修復
- ✅ `subscription/route.ts` 變數名稱衝突 (2025-12-08)

### 待確認
- ⚠️ Webhook 簽名驗證在生產環境的表現
- ⚠️ Admin 白名單在多用戶情況下的效能

---

## 📚 相關文檔

- [安全性強化報告](./安全性強化報告_2025-12-01.md)
- [SMOKE_AUTH_SUBSCRIPTION.md](./SMOKE_AUTH_SUBSCRIPTION.md)
- [PAYMENTS.md](./PAYMENTS.md)

---

**最後更新**: 2025-12-08
