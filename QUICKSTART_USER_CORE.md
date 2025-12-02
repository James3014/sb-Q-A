# 🚀 user-core 整合快速開始

## 5 分鐘快速測試

### 步驟 1：配置環境變數（1 分鐘）

```bash
cd 單板教學/web

# 如果 .env.local 不存在，複製範本
cp .env.local.example .env.local

# 編輯 .env.local，添加或確認以下內容：
# NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
```

### 步驟 2：啟動應用（1 分鐘）

```bash
# 確保依賴已安裝
npm install

# 啟動開發服務器
npm run dev
```

應用會在 http://localhost:3000 啟動

### 步驟 3：測試用戶註冊（2 分鐘）

1. **打開瀏覽器**
   - 訪問 http://localhost:3000/login

2. **打開開發者工具**
   - 按 F12 或右鍵 → 檢查
   - 切換到 Console 標籤

3. **註冊新用戶**
   - 輸入 Email 和密碼
   - 點擊「註冊」

4. **查看控制台日誌**
   - 應該看到：
   ```
   [UserCoreSync] User synced successfully: <user_id>
   ```
   - 如果看到錯誤，也沒關係，用戶仍然可以正常使用

### 步驟 4：驗證同步（1 分鐘）

```bash
# 檢查 user-core 是否收到資料
curl -s "https://user-core.zeabur.app/users/?limit=5" | python3 -m json.tool

# 查找你剛註冊的用戶 ID
```

## ✅ 成功標誌

如果你看到以下內容，說明整合成功：

1. ✅ 用戶可以正常註冊和登入
2. ✅ 控制台顯示 `[UserCoreSync] User synced successfully`
3. ✅ user-core API 返回新用戶的資料

## ⚠️ 常見問題

### Q: 控制台顯示 "Failed to sync user"

**A:** 這是正常的，不影響用戶使用。可能原因：
- user-core 服務暫時不可用
- 網絡問題
- 用戶已存在

**解決方案**：
- 檢查 user-core 服務狀態：`curl https://user-core.zeabur.app/docs`
- 查看詳細錯誤訊息
- 如果持續失敗，可以暫時忽略

### Q: 環境變數沒有生效

**A:** 確保：
1. `.env.local` 文件在 `web/` 目錄下
2. 變數名稱正確：`NEXT_PUBLIC_USER_CORE_API_URL`
3. 重啟開發服務器（Ctrl+C 然後 `npm run dev`）

### Q: 用戶註冊後沒有看到同步日誌

**A:** 檢查：
1. 瀏覽器控制台是否打開
2. 控制台過濾器是否設置為顯示所有日誌
3. 嘗試註冊另一個用戶

## 📊 測試腳本

運行自動化測試：

```bash
cd 單板教學
bash scripts/test-user-core-integration.sh
```

這會測試：
- ✅ user-core 服務狀態
- ✅ API 連接
- ✅ 用戶創建
- ✅ 事件發送
- ✅ 環境變數配置

## 🎯 下一步

整合成功後，你可以：

1. **查看整合文檔**
   - 閱讀 `docs/USER_CORE_INTEGRATION.md`
   - 了解完整的架構和 API

2. **實施 Phase 2**
   - 添加事件同步
   - 同步課程瀏覽、練習完成等事件

3. **測試 snowbuddy-matching**
   - snowbuddy-matching 現在可以訪問單板教學的用戶資料
   - 基於學習行為進行媒合

## 📞 需要幫助？

- 查看 [整合文檔](docs/USER_CORE_INTEGRATION.md)
- 查看 [user-core API 文檔](https://user-core.zeabur.app/docs)
- 查看 [整合總結](USER_CORE_INTEGRATION_SUMMARY.md)

---

**預計時間**：5 分鐘
**難度**：簡單
**影響**：無（非阻塞整合）
