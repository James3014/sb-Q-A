# 部署檢查清單

**日期**: 2025-12-08

---

## 1️⃣ Zeabur 環境變數設定

登入 Zeabur → 選擇專案 → Settings → Environment Variables

### 必須設定

```bash
# Admin 授權
ADMIN_EMAILS=你的管理員email@example.com
ADMIN_ROLES=admin,coach

# Webhook 安全
PAYMENT_WEBHOOK_SECRET=生成一個強密碼
```

### 生成 Webhook Secret

```bash
# 在本地執行
openssl rand -hex 32
```

---

## 2️⃣ 部署後驗證

### A. 檢查標題
```bash
curl https://sb-qa-web.zeabur.app/ | grep "<title>"
```
**預期**: `<title>單板教學 | 專業滑雪板教學平台</title>`

### B. 測試 Admin API (401)
```bash
curl https://sb-qa-web.zeabur.app/api/admin/dashboard
```
**預期**: `{"error":"Missing token"}` (401)

### C. 測試 Webhook (401)
```bash
curl -X POST https://sb-qa-web.zeabur.app/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```
**預期**: `{"error":"Missing signature"}` (401)

---

## 3️⃣ 完整功能測試

### A. 管理員登入測試
1. 訪問 https://sb-qa-web.zeabur.app/admin
2. 用管理員帳號登入
3. 確認可以看到 Dashboard

### B. 一般用戶測試
1. 用非管理員帳號登入
2. 訪問 /admin
3. 確認顯示「無權限」

### C. Webhook 測試（需要 ŌEN Tech）
1. 在 ŌEN Tech 後台設定 webhook URL
2. 觸發測試支付
3. 檢查 Zeabur logs 確認簽名驗證通過

---

## 4️⃣ 監控

### Zeabur Logs
```
Zeabur → 專案 → Logs
```

**關注**:
- ❌ 401/403 錯誤（授權問題）
- ❌ 500 錯誤（程式錯誤）
- ✅ Webhook 簽名驗證成功

---

## ✅ 完成檢查清單

- [ ] 設定 `ADMIN_EMAILS`
- [ ] 設定 `PAYMENT_WEBHOOK_SECRET`
- [ ] 重新部署
- [ ] 驗證標題正確
- [ ] 驗證 Admin API 401
- [ ] 驗證 Webhook 401
- [ ] 管理員登入測試
- [ ] 一般用戶權限測試
- [ ] 檢查 Zeabur logs 無錯誤

---

**預計時間**: 10-15 分鐘
