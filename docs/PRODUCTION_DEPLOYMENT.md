# 生產環境部署指南

## 概述

本文檔提供單板教學應用（含 user-core 整合）的生產環境部署指南。

## 部署前檢查清單

### 1. 代碼準備

- [ ] 所有代碼已提交到 Git
- [ ] 通過所有測試（`npm run build`）
- [ ] 沒有 TypeScript 錯誤
- [ ] 沒有 ESLint 警告（關鍵的）

### 2. 環境變數配置

#### 必需的環境變數

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password

# user-core
NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
```

#### 可選的環境變數（性能調優）

```bash
# 關閉調試模式（生產環境）
NEXT_PUBLIC_USER_CORE_DEBUG=false

# 調整批次大小（根據流量）
NEXT_PUBLIC_USER_CORE_BATCH_SIZE=20        # 高流量時增加
NEXT_PUBLIC_USER_CORE_BATCH_INTERVAL=3000  # 高流量時減少

# 調整超時時間
NEXT_PUBLIC_USER_CORE_TIMEOUT=10000        # 網絡較慢時增加
```

### 3. user-core 服務檢查

```bash
# 檢查 user-core 服務狀態
curl https://user-core.zeabur.app/docs

# 測試 API 連接
curl -X GET "https://user-core.zeabur.app/users/?limit=1"
```

### 4. 資料庫準備

- [ ] Supabase 資料庫已配置
- [ ] RLS 政策已啟用
- [ ] 所有 migrations 已執行
- [ ] 測試資料已清理（如果需要）

---

## Zeabur 部署步驟

### 步驟 1：準備 Git Repository

```bash
# 確保所有更改已提交
git add .
git commit -m "feat: add user-core integration phase 3"
git push origin main
```

### 步驟 2：在 Zeabur 創建服務

1. 登入 [Zeabur Dashboard](https://dash.zeabur.com/)
2. 選擇或創建專案
3. 點擊 "Create Service"
4. 選擇 "Git" → 連接你的 Repository
5. 選擇 `單板教學/web` 目錄

### 步驟 3：配置環境變數

在 Zeabur 服務設置中添加所有環境變數：

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_ADMIN_PASSWORD=...
NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
NEXT_PUBLIC_USER_CORE_DEBUG=false
```

### 步驟 4：部署

1. Zeabur 會自動偵測 Next.js 專案
2. 自動執行 `npm install` 和 `npm run build`
3. 部署完成後會提供 URL

### 步驟 5：驗證部署

```bash
# 替換成你的部署 URL
DEPLOY_URL="https://your-app.zeabur.app"

# 檢查首頁
curl -I $DEPLOY_URL

# 檢查 API（如果有）
curl $DEPLOY_URL/api/health
```

---

## 部署後驗證

### 1. 功能測試

- [ ] 用戶可以註冊
- [ ] 用戶可以登入
- [ ] 課程可以正常瀏覽
- [ ] 搜尋功能正常
- [ ] 收藏功能正常
- [ ] 練習紀錄功能正常

### 2. user-core 整合測試

#### 測試用戶同步

```bash
# 1. 在應用中註冊新用戶
# 2. 檢查 user-core 是否收到資料
curl "https://user-core.zeabur.app/users/?limit=10" | python3 -m json.tool
```

#### 測試事件同步

```bash
# 1. 在應用中瀏覽課程、搜尋、收藏等
# 2. 檢查 user-core 事件
USER_ID="your-user-id"
curl "https://user-core.zeabur.app/events?user_id=$USER_ID&limit=20" | python3 -m json.tool
```

#### 檢查監控統計

在瀏覽器控制台執行：

```javascript
// 查看統計
window.__userCoreStats.printStatsReport()

// 查看健康狀態
window.__userCoreStats.getHealthStatus()

// 查看配置
window.__userCoreConfig.printConfig()
```

### 3. 性能測試

#### 頁面載入時間

```bash
# 使用 curl 測試
time curl -o /dev/null -s -w '%{time_total}\n' $DEPLOY_URL
```

#### 事件同步延遲

在瀏覽器控制台查看：
```
[UserCoreSync] Event synced: snowboard.lesson.viewed (45ms)
```

預期：< 100ms

### 4. 錯誤監控

#### 檢查瀏覽器控制台

- 不應該有紅色錯誤
- user-core 同步失敗應該是黃色警告（不影響功能）

#### 檢查 Zeabur 日誌

1. 進入 Zeabur Dashboard
2. 選擇服務
3. 查看 "Logs" 標籤
4. 確認沒有嚴重錯誤

---

## 監控和維護

### 1. 日常監控

#### 每日檢查

- [ ] 檢查 Zeabur 服務狀態
- [ ] 檢查 user-core 服務狀態
- [ ] 查看錯誤日誌

#### 每週檢查

- [ ] 查看 user-core 同步統計
- [ ] 查看性能指標
- [ ] 檢查資料庫使用量

### 2. 監控指標

#### user-core 同步健康度

```javascript
// 在瀏覽器控制台
const health = window.__userCoreStats.getHealthStatus()
console.log('User Sync Success Rate:', (health.userSync.successRate * 100).toFixed(1) + '%')
console.log('Event Sync Success Rate:', (health.eventSync.successRate * 100).toFixed(1) + '%')
```

**目標**：
- 用戶同步成功率 > 95%
- 事件同步成功率 > 95%
- 平均響應時間 < 200ms

#### 性能指標

- 首頁載入時間 < 2 秒
- 課程詳情頁載入時間 < 1.5 秒
- API 響應時間 < 500ms

### 3. 告警設置

#### 建議的告警規則

| 指標 | 閾值 | 行動 |
|------|------|------|
| user-core 同步失敗率 | > 10% | 檢查 user-core 服務 |
| 事件同步失敗率 | > 10% | 檢查網絡連接 |
| 平均響應時間 | > 500ms | 檢查性能瓶頸 |
| 錯誤率 | > 1% | 查看錯誤日誌 |

---

## 故障排除

### 問題 1：user-core 同步失敗率高

**症狀**：
- 控制台頻繁顯示 `[UserCoreSync] Failed to sync`
- 成功率 < 90%

**可能原因**：
1. user-core 服務不可用
2. 網絡問題
3. API 請求格式錯誤

**解決方案**：

```bash
# 1. 檢查 user-core 服務
curl https://user-core.zeabur.app/docs

# 2. 檢查網絡連接
ping user-core.zeabur.app

# 3. 查看詳細錯誤
# 在瀏覽器控制台查看完整錯誤訊息

# 4. 臨時禁用同步（如果需要）
window.__userCoreConfig.updateConfig({
  enableUserSync: false,
  enableEventSync: false
})
```

### 問題 2：性能下降

**症狀**：
- 頁面載入變慢
- 用戶操作有延遲

**可能原因**：
1. 批次處理配置不當
2. user-core 響應慢
3. 資料庫查詢慢

**解決方案**：

```bash
# 1. 調整批次處理配置
# 在 Zeabur 環境變數中設置：
NEXT_PUBLIC_USER_CORE_BATCH_SIZE=20
NEXT_PUBLIC_USER_CORE_BATCH_INTERVAL=3000

# 2. 增加超時時間
NEXT_PUBLIC_USER_CORE_TIMEOUT=10000

# 3. 檢查 user-core 響應時間
time curl -o /dev/null -s https://user-core.zeabur.app/users/?limit=1
```

### 問題 3：事件丟失

**症狀**：
- user-core 中的事件數量少於預期
- 某些事件類型缺失

**可能原因**：
1. 批次刷新前頁面關閉
2. 網絡錯誤導致發送失敗
3. 事件映射錯誤

**解決方案**：

```bash
# 1. 減少批次間隔（更頻繁刷新）
NEXT_PUBLIC_USER_CORE_BATCH_INTERVAL=2000

# 2. 減少批次大小（更早觸發）
NEXT_PUBLIC_USER_CORE_BATCH_SIZE=5

# 3. 檢查事件映射
# 查看 web/src/lib/analytics.ts 中的 EVENT_TYPE_MAPPING
```

---

## 回滾計劃

### 如果需要回滾

#### 選項 1：禁用 user-core 整合

```bash
# 在 Zeabur 環境變數中設置：
NEXT_PUBLIC_USER_CORE_ENABLE_USER_SYNC=false
NEXT_PUBLIC_USER_CORE_ENABLE_EVENT_SYNC=false

# 重新部署
```

**影響**：
- ✅ 應用繼續正常運作
- ✅ 所有功能可用
- ❌ 不會同步到 user-core
- ❌ snowbuddy-matching 無法獲取新資料

#### 選項 2：回滾到之前的版本

```bash
# 1. 找到之前的 commit
git log --oneline

# 2. 回滾
git revert <commit-hash>

# 3. 推送
git push origin main

# 4. Zeabur 會自動重新部署
```

---

## 性能優化建議

### 1. 批次處理優化

根據流量調整：

| 日活躍用戶 | 批次大小 | 批次間隔 |
|-----------|---------|---------|
| < 100 | 10 | 5000ms |
| 100-500 | 20 | 3000ms |
| 500-1000 | 30 | 2000ms |
| > 1000 | 50 | 1000ms |

### 2. 超時配置

根據網絡環境：

| 環境 | 超時時間 |
|------|---------|
| 本地開發 | 5000ms |
| 測試環境 | 8000ms |
| 生產環境（國內） | 5000ms |
| 生產環境（國際） | 10000ms |

### 3. 功能開關

在低峰時段啟用所有功能，高峰時段可以選擇性禁用：

```bash
# 高峰時段（可選）
NEXT_PUBLIC_USER_CORE_ENABLE_MONITORING=false  # 減少開銷
```

---

## 安全檢查

### 1. 環境變數安全

- [ ] 所有敏感資訊使用環境變數
- [ ] 不在代碼中硬編碼 API keys
- [ ] `.env.local` 已加入 `.gitignore`

### 2. API 安全

- [ ] user-core API 使用 HTTPS
- [ ] Supabase RLS 政策已啟用
- [ ] Admin 密碼足夠強

### 3. 資料安全

- [ ] 用戶資料加密傳輸
- [ ] 敏感資料不紀錄到日誌
- [ ] 遵守 GDPR/個資法規定

---

## 聯絡與支援

### 文檔

- [整合文檔](USER_CORE_INTEGRATION.md)
- [事件映射](EVENT_MAPPING.md)
- [測試指南](PHASE2_TESTING.md)

### 服務狀態

- user-core: https://user-core.zeabur.app/docs
- Supabase: https://supabase.com/dashboard

### 緊急聯絡

如遇嚴重問題：
1. 立即禁用 user-core 整合（見回滾計劃）
2. 查看錯誤日誌
3. 聯絡技術支援

---

*最後更新：2025-12-02*
*版本：Phase 3*
