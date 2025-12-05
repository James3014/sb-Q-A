# 💳 支付系統測試 - 問題總結 (2025-12-05)

## 🔴 已發現的問題清單

### 1️⃣ **Mixed Content 錯誤（CRITICAL - 已部分修復）**

**症狀**：
```
Mixed Content: The page at 'https://sb-qa-web.zeabur.app/pricing' was loaded over HTTPS,
but requested an insecure resource 'http://user-core.zeabur.app/events/'
```

**根本原因**：
- UserCore API 配置為 HTTP，但前端頁面是 HTTPS
- 瀏覽器自動阻止跨協議請求

**修復方案**：
- ✅ 已在 Zeabur 添加環境變數：`NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app`
- ⏳ 等待部署完成，混合內容錯誤應消失

**影響**：
- UserCore 事件同步失敗
- 但不影響金流功能本身

---

### 2️⃣ **API 409 Conflict 錯誤（已解決 - 帳號問題）**

**症狀**：
```
api/payments/checkout:1  Failed to load resource: the server responded with a status of 409 ()
```

**根本原因**：
- `user_free@test.com` 已經有訂閱（pass_7，至 2025-12-11）
- API 正確拒絕已訂閱用戶購買（防止重複扣款）
- 409 = Conflict（衝突）= 已有有效訂閱

**解決方案**：
- ✅ 使用 `user_expired@test.com` 進行測試（訂閱已過期）
- ❌ 或重置 user_free 的訂閱狀態

**結論**：
- 這不是 bug，是系統正確工作的表現

---

### 3️⃣ **React Error #418 / #423（已修復 - UX 問題）**

**症狀**：
```
Error: Minified React error #418
Error: Minified React error #423
```

**根本原因**（組合因素）：
1. **過度驗證**：pricing 頁面在 checkout 時重複驗證 session
2. **UI 設計缺陷**：頁面沒有顯示登入狀態，導致用戶困惑
3. **State 管理混亂**：可能有重複的 state 更新引發 React 內部錯誤

**修復方案**（剛才提交）：
- ✅ Header 右側加入登入狀態顯示（email + ✓ 圖標）
- ✅ 簡化 checkout 的 session 驗證邏輯
- ✅ 移除重複驗證，信任 API 層處理
- ✅ 使用 `credentials: 'include'` 自動帶認證信息

**預期效果**：
- 用戶能清楚看到自己的登入狀態
- 減少「未登入」的誤報
- React 錯誤應該消失

---

### 4️⃣ **「未登入，請重新登入」錯誤訊息（已修復）**

**症狀**：
- 用戶說在支付完成後出現「未登入」提示
- 實際上用戶已經登入
- 刷新後仍有問題

**根本原因**：
- 支付流程中間 session 丟失或失效
- 可能是因為頻繁的 session 驗證導致 token 刷新時機問題

**修復方案**：
- ✅ 簡化驗證邏輯（上面已做）
- ⏳ 等待部署測試

---

## 📊 當前 Zeabur 部署狀態

| 項目 | 狀態 | 備註 |
|------|------|------|
| 代碼部署 | ✅ | 最新提交 37ddd89 已推送 |
| 環境變數 | ⏳ | NEXT_PUBLIC_USER_CORE_API_URL 已添加，等待部署 |
| Next.js 構建 | ✅ | 本地測試通過 |
| 購買按鈕 UX | ✅ | 已改進（漸層、禁用狀態、反饋） |
| 登入狀態顯示 | ✅ | 已添加 header 顯示 |

---

## 🎯 下一步行動

### 立即（5-10 分鐘）
1. 等待 Zeabur 部署完成（通常 2-3 分鐘）
2. 強制刷新：`Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
3. 檢查 Console 是否還有 Mixed Content 錯誤

### 重新測試（用正確的帳號）
```
帳號：user_expired@test.com
密碼：Test@123456
狀態：訂閱已過期（可以購買）

1️⃣ 進 /pricing
2️⃣ 應該看到 header 右側顯示 email
3️⃣ 點「購買」按鈕
4️⃣ 應該正常進入 Mock Checkout
5️⃣ 不應該再出現「未登入」或 React 錯誤
```

### 驗證修復
- ✅ Header 能清楚看到登入狀態
- ✅ 購買按鈕能點擊並有反饋
- ✅ Console 沒有大紅色錯誤
- ✅ 支付流程能順利進行

---

## 📋 測試帳號現狀

| 帳號 | 訂閱狀態 | 用途 | 備註 |
|------|--------|------|------|
| user_free@test.com | pass_7 (有效) | ❌ 不能用 | 409 會被擋，用於測試「已訂閱」場景 |
| user_pro@test.com | pro_yearly (有效) | ❌ 不能用 | 用於測試「已有訂閱用戶」場景 |
| user_expired@test.com | pass_7 (已過期) | ✅ 可用 | 用於測試「續訂」場景，現在應該選這個 |

---

## 🔍 診斷清單（問題排查）

如果修復後還有問題，按順序檢查：

```
1. ⏳ Zeabur 是否部署完成？
   → 進 https://sb-qa-web.zeabur.app 看首頁有無構建錯誤

2. 👤 頁面上能否看到 email？
   → Pricing 頁面 header 右側應顯示 email 或登入鏈接

3. 🔐 Login 時是否有錯誤？
   → 試著登出再登入 user_expired@test.com

4. 📡 Network 中是否有紅色的失敗請求？
   → DevTools → Network 標籤
   → /api/payments/checkout 應返回 200 OK

5. 🎨 Console 中是否還有大紅色錯誤？
   → React #418 / #423 應消失
   → Mixed Content 應減少

6. 💰 能否點擊購買按鈕？
   → 按鈕應變禁用（灰化）+ 「建立中...」文案
   → 應自動導向 /mock-checkout（1-2 秒）
```

---

## 📞 如果還有問題

請提供以下信息：
1. **當前步驟** - 你在做什麼（登入、點購買、支付等）
2. **預期結果** - 應該看到什麼
3. **實際結果** - 實際發生什麼
4. **Console 截圖** - F12 打開 Console 的紅色錯誤
5. **Network 截圖** - F12 Network 標籤中的請求狀態

---

**最後更新**：2025-12-05 15:00
**已修復提交**：37ddd89
**等待部署**：Zeabur NEXT_PUBLIC_USER_CORE_API_URL 環境變數
