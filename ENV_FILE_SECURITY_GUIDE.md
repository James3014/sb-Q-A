# .env 文件安全指南 🔐

**文檔日期**: 2025年12月11日
**狀態**: ✅ 已驗證
**風險等級**: 🟡 中等（需要輪換 Token）

---

## 📋 .env 文件中的內容分析

### 現況概覽

你的 `.env` 文件包含：

```env
SUPABASE_URL=https://nbstwggxfwvfruwgfcqd.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiI...                    # ⚠️ Anon Key
PAYMENT_PROVIDER=oentech
PAYMENT_OENTECH_API_URL=https://payment-api.testing.oen.tw
PAYMENT_OENTECH_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...      # 🔴 私鑰 Token
PAYMENT_OENTECH_MERCHANT_ID=james523
PAYMENT_WEBHOOK_SECRET=oentech_webhook_secret          # 🔴 密鑰
```

---

## 🔍 逐項分析

### 1️⃣ SUPABASE_KEY (Anon Key)

#### 風險等級: 🟡 中等

```
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**這是什麼?**
- Supabase 的匿名公鑰 (anon key)
- 用於前端直接連接 Supabase
- 權限受 RLS (Row Level Security) 限制

**安全性評估:**
- ✅ 設計上是**可以公開**的
- ✅ 前端代碼中會包含這個 key
- ❌ 但仍不應在 Git 中暴露（即使是 anon key）
- ✅ **沒有直接危害**，因為受 RLS 保護

**如果被盜用:**
- 攻擊者可以讀寫**受 RLS 允許**的數據
- 無法繞過 RLS 規則
- 無法訪問被 RLS 禁止的行

**行動:** 可以放心，但下次應避免 commit

---

### 2️⃣ PAYMENT_OENTECH_TOKEN

#### 風險等級: 🔴 高危

```
PAYMENT_OENTECH_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1Ni...
```

**這是什麼?**
- 完整的 JWT Token with **RS256 簽名**（需要私鑰簽名）
- 用於後端調用 OenTech Payment API
- 代表應用對 OenTech 的身份

**安全性評估:**
```
解析這個 Token 的 Header:
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "912734..." ← 私鑰 ID
}

Payload:
{
  "domain": "james523",
  "iss": "https://test.oen.tw",
  "aud": "https://payment-api.development.oen.tw"
}
```

**危害:**
- 🔴 攻擊者可以用這個 Token 冒充你的應用
- 🔴 可以發起支付、查詢交易、退款等操作
- 🔴 這是一個**完全的身份證明**

**如果被盜用:**
- 攻擊者可以：
  - 修改支付狀態
  - 偽造支付成功通知
  - 查看所有交易歷史
  - 發起退款到自己的帳戶

**行動:** 🚨 **必須立即輪換**

---

### 3️⃣ PAYMENT_WEBHOOK_SECRET

#### 風險等級: 🔴 高危

```
PAYMENT_WEBHOOK_SECRET=oentech_webhook_secret
```

**這是什麼?**
- 用於驗證 OenTech webhook 回調的簽名
- HMAC-SHA256 加密密鑰
- 應用用它驗證：「這個回調確實來自 OenTech」

**安全性評估:**
```
攻擊流程（如果被盜用）:

1. 攻擊者知道 webhook secret
2. 攻擊者構造假的支付成功 webhook:
   {
     "status": "success",
     "payment_id": "real-payment-id",
     "user_id": "target-user-id"
   }
3. 攻擊者計算正確的簽名:
   signature = HMAC-SHA256(payload, webhook_secret)
4. 攻擊者發送到你的 webhook endpoint
5. 你的應用驗證簽名 ✅ 通過
6. 應用錯誤地激活用戶的訂閱

💥 結果: 免費啟動訂閱！
```

**危害:**
- 🔴 攻擊者可以**偽造支付成功通知**
- 🔴 可以激活任何用戶的訂閱而無需支付
- 🔴 導致大規模的收入損失

**行動:** 🚨 **必須立即輪換**

---

## ✅ Git 安全狀態檢查結果

```bash
$ git check-ignore .env
.env

✅ 結果: .env 被正確忽略
```

```bash
$ git log --all --full-history -- .env
(無輸出)

✅ 結果: .env 從未被提交到 Git history
```

---

## 📊 安全風險矩陣

| Token/密鑰 | 暴露狀態 | 風險等級 | 行動 |
|-----------|--------|--------|------|
| SUPABASE_KEY | 本機 + 前端 | 🟡 中 | 保持但避免 commit |
| PAYMENT_OENTECH_TOKEN | 本機 + Zeabur | 🔴 高 | ⚠️ **立即輪換** |
| PAYMENT_WEBHOOK_SECRET | 本機 + Zeabur | 🔴 高 | ⚠️ **立即輪換** |

---

## 🛠️ 應該移除 .env 嗎？

### ❌ 不應該完全移除

**原因:**
1. 本機開發需要 `.env`
2. `.gitignore` 已經正確配置
3. 文件本身不在 Git 中

### ✅ 應該做的

#### 方案 A: 保留但輪換敏感信息 (推薦)

```bash
# 1. 輪換 Token (見下方步驟)

# 2. 更新 .env 中的新 Token
nano .env
# 將新的 PAYMENT_OENTECH_TOKEN 和 PAYMENT_WEBHOOK_SECRET 粘貼進去

# 3. 驗證 .env 未被追蹤
git status .env  # 應該不出現

# 4. 確保 .gitignore 有 .env
grep "^\.env" .gitignore  # 應該找到
```

#### 方案 B: 使用 .env.example + .env.local

```bash
# 已有 .env.example 作為模板 ✅
# .env.local 用於本機覆蓋 ✅

# 確認 .gitignore:
grep "\.env" .gitignore
# 應該包含:
# .env
# .env.local
```

---

## 🚨 立即行動: 輪換 Token

### Step 1: 輪換 PAYMENT_OENTECH_TOKEN

**在 OenTech 後台**:
```
1. 登入 https://merchant.oen.tw
2. 選擇 Merchant: james523
3. 進入 Settings > API Keys
4. 找到 Payment API Token
5. 點擊 "Generate New Token"
6. 複製新 Token
```

**更新 Zeabur**:
```
1. 登入 Zeabur Dashboard
2. 選擇你的 Project (DIY Ski)
3. 進入 Settings > Environment Variables
4. 找到 PAYMENT_OENTECH_TOKEN
5. 點擊編輯，粘貼新 Token
6. 保存並重新部署
```

**更新本機 .env**:
```bash
# 編輯本機 .env
nano .env

# 找到:
PAYMENT_OENTECH_TOKEN=eyJ0eXAi...

# 替換為新 Token:
PAYMENT_OENTECH_TOKEN=[新 Token]

# 保存
```

### Step 2: 輪換 PAYMENT_WEBHOOK_SECRET

**生成新密鑰**:
```bash
# 使用 OpenSSL 生成隨機密鑰
openssl rand -hex 32

# 示例輸出:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

**在 OenTech 設置**:
```
1. OenTech 後台 > Settings > Webhooks
2. 找到你的 Webhook URL
3. 點擊編輯
4. 在 "Webhook Secret" 欄位輸入新密鑰
5. 保存
```

**更新 Zeabur**:
```
1. Zeabur Dashboard > Environment Variables
2. 找到 PAYMENT_WEBHOOK_SECRET
3. 替換為新密鑰
4. 保存並重新部署
```

**更新本機 .env**:
```bash
nano .env

# 找到:
PAYMENT_WEBHOOK_SECRET=oentech_webhook_secret

# 替換為:
PAYMENT_WEBHOOK_SECRET=[新密鑰]
```

### Step 3: 驗證部署成功

```bash
# 1. 確認 Zeabur 部署完成
# Zeabur Dashboard > Deployments > 查看最新

# 2. 測試支付流程
# 訪問 https://www.snowskill.app/pricing
# 嘗試購買課程

# 3. 查看 webhook 日誌
# 確認新密鑰生效
```

---

## 📋 完整安全檢查清單

### .env 文件本身

- [x] ✅ `.env` 被 `.gitignore` 正確忽略
- [x] ✅ `.env` 從未被提交到 Git history
- [ ] ⏳ **待做**: 輪換 `PAYMENT_OENTECH_TOKEN`
- [ ] ⏳ **待做**: 輪換 `PAYMENT_WEBHOOK_SECRET`
- [ ] ⏳ **待做**: 在 Zeabur 環境變數更新新值

### Git 安全性

- [x] ✅ `.gitignore` 配置正確
- [x] ✅ 敏感文件未在 history 中
- [x] ✅ `.env.example` 提供了安全模板

### Zeabur 部署安全性

- [x] ✅ 環境變數已在 Zeabur 中設置
- [x] ✅ 部署環境使用 Zeabur env，不讀取本地 .env
- [ ] ⏳ **待做**: 更新為新 Token

### 開發機器安全性

- [x] ✅ `.env` 在本機不會被意外提交
- [ ] ⏳ **待做**: 定期輪換敏感信息

---

## 🎯 最佳實踐

### 開發團隊

如果有多個開發者：

```bash
# 1. 提交 .env.example 到 Git（不含實際值）
.env.example:
```
SUPABASE_URL=
SUPABASE_KEY=
PAYMENT_PROVIDER=
PAYMENT_OENTECH_API_URL=
PAYMENT_OENTECH_TOKEN=
PAYMENT_OENTECH_MERCHANT_ID=
PAYMENT_WEBHOOK_SECRET=
```

# 2. 每個開發者複製並填入自己的值
cp .env.example .env

# 3. 不要 commit .env
git add .env  # ❌ 不要這樣做
```

### 定期輪換策略

```
定期輪換表:
├─ PAYMENT_OENTECH_TOKEN: 每 3 個月 或 員工離職時
├─ PAYMENT_WEBHOOK_SECRET: 每 6 個月 或 懷疑被盜時
└─ SUPABASE_KEY (anon): 可以保留，因為受 RLS 保護
```

---

## 📞 常見問題

### Q1: 為什麼 SUPABASE_KEY 可以在前端?

A: 因為它是 **anon key**（匿名金鑰），設計上就是給前端用的。權限受 RLS (Row Level Security) 規則限制，只能訪問允許的數據。

### Q2: 如果 Token 洩露了，什麼時候才會被發現?

A:
- 攻擊者可能立即開始冒充調用 API
- 如果用於支付，可能幾分鐘內就發起詐騙交易
- 務必立即輪換

### Q3: 輪換 Token 需要停機嗎?

A: 不需要。步驟：
1. 生成新 Token
2. 在 Zeabur 環境變數中更新
3. Zeabur 自動重新部署
4. 應用無縫使用新 Token

### Q4: 舊 Token 應該怎麼處理?

A: 在 OenTech 後台禁用或刪除舊 Token，確保無法再使用。

---

## ✅ 總結

| 項目 | 狀態 | 行動 |
|------|------|------|
| .env 被忽略 | ✅ | 無需改動 |
| .env 未被提交 | ✅ | 無需改動 |
| SUPABASE_KEY 安全 | ✅ | 無需輪換 |
| PAYMENT_OENTECH_TOKEN | 🔴 | **立即輪換** |
| PAYMENT_WEBHOOK_SECRET | 🔴 | **立即輪換** |

---

**建議**:
1. ✅ 保留 `.env` 在本機
2. 🔴 **立即輪換兩個關鍵 Token**
3. ✅ 在 Zeabur 更新新值
4. ✅ 驗證部署正常運作

**時間成本**: 15-20 分鐘完成所有步驟

---

**文檔版本**: 1.0
**最後更新**: 2025年12月11日
**安全審查**: Claude Code
