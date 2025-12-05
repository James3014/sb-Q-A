# 🔗 User Core 整合文件

**最後更新**: 2025-12-05

---

## 目錄

1. [快速開始](#快速開始)
2. [整合架構](#整合架構)
3. [實施階段](#實施階段)
4. [API 參考](#api-參考)
5. [測試指南](#測試指南)

---

## 快速開始

### 5 分鐘快速測試

#### 步驟 1：配置環境變數（1 分鐘）

```bash
cd 單板教學/web

# 如果 .env.local 不存在，複製範本
cp .env.local.example .env.local

# 編輯 .env.local，添加或確認以下內容：
# NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
```

#### 步驟 2：啟動應用（1 分鐘）

```bash
# 確保依賴已安裝
npm install

# 啟動開發服務器
npm run dev
```

應用會在 http://localhost:3000 啟動

#### 步驟 3：測試用戶註冊（2 分鐘）

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

#### 步驟 4：驗證同步（1 分鐘）

```bash
# 檢查 user-core 是否收到資料
curl -s "https://user-core.zeabur.app/users/?limit=5" | python3 -m json.tool

# 查找你剛註冊的用戶 ID
```

### 成功標誌

如果你看到以下內容，說明整合成功：

1. ✅ 用戶可以正常註冊和登入
2. ✅ 控制台顯示 `[UserCoreSync] User synced successfully`
3. ✅ user-core API 返回新用戶的資料

### 常見問題

#### Q: 控制台顯示 "Failed to sync user"

**A:** 這是正常的，不影響用戶使用。可能原因：
- user-core 服務暫時不可用
- 網絡問題
- 用戶已存在

**解決方案**：
- 檢查 user-core 服務狀態：`curl https://user-core.zeabur.app/docs`
- 查看詳細錯誤訊息
- 如果持續失敗，可以暫時忽略

#### Q: 環境變數沒有生效

**A:** 確保：
1. `.env.local` 文件在 `web/` 目錄下
2. 變數名稱正確：`NEXT_PUBLIC_USER_CORE_API_URL`
3. 重啟開發服務器（Ctrl+C 然後 `npm run dev`）

#### Q: 用戶註冊後沒有看到同步日誌

**A:** 檢查：
1. 瀏覽器控制台是否打開
2. 控制台過濾器是否設置為顯示所有日誌
3. 嘗試註冊另一個用戶

---

## 整合架構

### 概述

本文檔說明單板教學應用如何與 user-core 服務整合，實現統一的用戶身份管理和跨專案數據共享。

### 架構圖

```
單板教學 App
├── Supabase Auth (認證)
│   └── 用戶註冊/登入
│
├── user-core 同步 (非阻塞)
│   ├── 用戶資料同步
│   └── 事件追蹤同步
│
└── Supabase Database (應用特定資料)
    ├── 訂閱資訊
    ├── 收藏
    └── 練習紀錄
```

### 整合策略

#### 混合架構原則

1. **保留 Supabase Auth**：所有認證流程保持不變
2. **非阻塞同步**：user-core 同步失敗不影響主流程
3. **漸進式整合**：分階段實施，風險可控
4. **向後兼容**：不破壞現有功能

#### 資料分層

| 資料類型 | 存儲位置 | 說明 |
|---------|---------|------|
| 認證資訊 | Supabase Auth | Email, 密碼, Session |
| 用戶檔案 | user-core | 角色, 技能等級, 語言偏好 |
| 訂閱資訊 | Supabase | 單板教學特有的業務邏輯 |
| 行為事件 | user-core | 跨專案共享的事件追蹤 |
| 收藏/練習 | Supabase | 單板教學特有的功能資料 |

---

## 實施階段

### Phase 1：用戶註冊同步 ✅ 已完成

**範圍**：
- 用戶註冊時同步到 user-core
- 創建基礎的 UserProfile

**修改的文件**：
- `web/src/lib/userCoreClient.ts` - API 客戶端
- `web/src/lib/userCoreSync.ts` - 同步邏輯
- `web/src/lib/auth.ts` - 註冊流程修改

**測試方法**：
```bash
# 1. 在單板教學註冊新用戶
# 2. 檢查 user-core 是否收到資料
curl https://user-core.zeabur.app/users/ | grep "新用戶的email"
```

### Phase 2：事件同步 ✅ 已完成

**範圍**：
- 課程瀏覽事件
- 練習完成事件
- 收藏操作事件
- 搜尋事件

**修改的文件**：
- `web/src/lib/analytics.ts` - 添加 user-core 事件同步

**實施內容**：
```typescript
// 在 analytics.ts 中添加
import { syncEventToCore } from './userCoreSync'

export async function trackEvent(
  eventType: EventType,
  lessonId?: string,
  metadata?: Record<string, unknown>
) {
  // ... 現有的 Supabase 邏輯 ...
  
  // 同步到 user-core
  if (user) {
    syncEventToCore(user.id, eventType, {
      lesson_id: lessonId,
      ...metadata
    }).catch(console.error)
  }
}
```

**事件映射**：

| 單板教學事件 | user-core 事件 |
|-------------|---------------|
| `view_lesson` | `snowboard.lesson.viewed` |
| `search_keyword` | `snowboard.search.performed` |
| `search_no_result` | `snowboard.search.no_result` |
| `pricing_view` | `snowboard.pricing.viewed` |
| `plan_selected` | `snowboard.plan.selected` |
| `purchase_success` | `snowboard.purchase.completed` |
| `favorite_add` | `snowboard.favorite.added` |
| `favorite_remove` | `snowboard.favorite.removed` |
| `practice_complete` | `snowboard.practice.completed` |
| `practice_start` | `snowboard.practice.started` |
| `scroll_depth` | `snowboard.content.scrolled` |

### Phase 3：完整整合 ✅ 已完成

**範圍**：
- 錯誤監控系統
- 性能追蹤
- 配置管理系統
- 功能開關
- 健康檢查
- 生產環境部署指南

**創建的文件**：
- `web/src/lib/userCoreMonitoring.ts` - 錯誤監控和性能追蹤
- `web/src/lib/userCoreConfig.ts` - 配置管理系統
- `docs/PRODUCTION_DEPLOYMENT.md` - 生產環境部署指南

**核心功能**：

#### 1. 錯誤監控系統

```javascript
// 在瀏覽器控制台
window.__userCoreStats.printStatsReport()

// 輸出：
// [UserCoreMonitoring] Statistics Report
//   User Sync
//     Total Attempts: 10
//     Success Count: 9
//     Failure Count: 1
//     Success Rate: 90.0%
//     Avg Response Time: 45ms
```

#### 2. 配置管理系統

```javascript
// 查看當前配置
window.__userCoreConfig.printConfig()

// 動態調整配置
window.__userCoreConfig.updateConfig({
  batchSize: 20,
  batchInterval: 3000,
  debug: true
})
```

#### 3. 健康檢查

```javascript
const health = window.__userCoreStats.getHealthStatus()

if (!health.healthy) {
  console.warn('⚠️ user-core integration unhealthy!')
  console.log('User Sync:', health.userSync.status)
  console.log('Event Sync:', health.eventSync.status)
}
```

---

## API 參考

### userCoreClient.ts

#### createUserInCore(userData)
創建用戶到 user-core。

**參數**：
```typescript
{
  user_id?: string
  roles?: string[]
  preferred_language?: string
  experience_level?: string
}
```

**返回**：
```typescript
{
  success: boolean
  data?: any
  error?: string
}
```

#### sendEventToCore(event)
發送事件到 user-core。

**參數**：
```typescript
{
  user_id: string
  source_project: 'snowboard-teaching'
  event_type: string
  occurred_at: string
  payload: Record<string, unknown>
}
```

### userCoreSync.ts

#### syncUserToCore(user)
同步 Supabase 用戶到 user-core（非阻塞）。

#### syncEventToCore(userId, eventType, payload)
同步事件到 user-core（非阻塞）。

#### queueEventSync(userId, eventType, payload)
將事件加入隊列，批次發送（性能優化）。

---

## 測試指南

### 1. 測試用戶註冊同步

```bash
# 步驟 1：註冊新用戶
# 在瀏覽器中訪問 http://localhost:3000/login
# 註冊一個新用戶

# 步驟 2：檢查 user-core
curl -s "https://user-core.zeabur.app/users/" | \
  python3 -m json.tool | \
  grep -A 10 "新用戶的ID"
```

### 2. 測試事件同步

```bash
# 步驟 1：瀏覽課程
# 在瀏覽器中訪問課程詳情頁

# 步驟 2：檢查事件
curl -s "https://user-core.zeabur.app/events?user_id=用戶ID" | \
  python3 -m json.tool
```

### 3. 監控同步狀態

在瀏覽器控制台查看日誌：
```
[UserCoreSync] User synced successfully: <user_id>
[UserCoreSync] Event synced: view_lesson
```

### 4. 批次處理測試

**目的**：驗證事件批次發送機制

**步驟**：
1. 快速瀏覽 10 個不同的課程
2. 觀察控制台

**預期結果**：
- 前 9 個課程：事件加入隊列，沒有立即發送
- 第 10 個課程：觸發批次發送
- 控制台顯示：`[UserCoreSync] Flushing 10 events...`

---

## 環境配置

### 開發環境

```bash
# .env.local
NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
```

### 生產環境

在 Zeabur 環境變數中設置：
```
NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
```

### 高級配置

```bash
# .env.local
NEXT_PUBLIC_USER_CORE_API_URL=https://user-core.zeabur.app
NEXT_PUBLIC_USER_CORE_TIMEOUT=5000
NEXT_PUBLIC_USER_CORE_BATCH_SIZE=10
NEXT_PUBLIC_USER_CORE_BATCH_INTERVAL=5000
NEXT_PUBLIC_USER_CORE_ENABLE_USER_SYNC=true
NEXT_PUBLIC_USER_CORE_ENABLE_EVENT_SYNC=true
NEXT_PUBLIC_USER_CORE_ENABLE_MONITORING=true
NEXT_PUBLIC_USER_CORE_DEBUG=false
```

---

## 錯誤處理

### 常見錯誤

#### 1. user-core 服務不可用
**症狀**：控制台顯示 `Failed to sync user`
**影響**：無影響，用戶可以正常使用
**解決**：等待 user-core 服務恢復

#### 2. 網絡超時
**症狀**：控制台顯示 `timeout`
**影響**：無影響，用戶可以正常使用
**解決**：自動重試或忽略

#### 3. 資料格式錯誤
**症狀**：控制台顯示 `HTTP 422`
**影響**：無影響，用戶可以正常使用
**解決**：檢查資料格式，更新同步邏輯

### 錯誤監控

所有錯誤都會紀錄到瀏覽器控制台，格式：
```
[UserCoreSync] <錯誤類型>: <錯誤訊息>
```

---

## 性能考慮

### 同步策略

1. **非阻塞**：所有 user-core 調用都是異步的
2. **超時控制**：5 秒超時，避免長時間等待
3. **批次處理**：事件可以批次發送
4. **失敗靜默**：失敗不影響用戶體驗

### 性能指標

| 操作 | 預期延遲 | 影響 |
|-----|---------|------|
| 用戶註冊 | +50-100ms | 極低 |
| 事件追蹤 | +50-100ms | 極低 |
| 批次事件 | 0ms（異步） | 無 |

---

## 未來規劃

### snowbuddy-matching 整合

user-core 的資料將用於：
1. **媒合算法**：基於技能等級、偏好雪場
2. **學習行為**：利用課程瀏覽、練習完成紀錄
3. **教練學生媒合**：單板教學的教練可以找到學生

### 跨專案數據共享

其他專案可以通過 user-core 訪問：
- 用戶基本資料
- 滑雪技能等級
- 學習行為紀錄
- 偏好設置

---

## 故障排除

### 檢查 user-core 服務狀態

```bash
curl https://user-core.zeabur.app/docs
```

### 檢查用戶是否同步

```bash
curl "https://user-core.zeabur.app/users/<user_id>"
```

### 檢查事件是否紀錄

```bash
curl "https://user-core.zeabur.app/events?user_id=<user_id>&limit=10"
```

---

## 整合狀態

### 已完成

✅ **Phase 1：用戶註冊同步**
- user-core API 客戶端
- 用戶註冊同步
- 非阻塞架構
- 錯誤處理

✅ **Phase 2：事件同步**
- 課程瀏覽事件同步
- 練習完成事件同步
- 收藏操作事件同步
- 搜尋事件同步
- 批次處理機制
- 事件映射標準化

✅ **Phase 3：完整整合**
- 錯誤監控系統
- 性能追蹤
- 配置管理系統
- 功能開關
- 健康檢查
- 生產環境部署指南

### 整合狀態

🎉 **生產環境就緒** - 所有三個階段已完成，可以立即部署到生產環境

### 關鍵成果

1. ✅ **不破壞現有功能**：所有修改都是增量的
2. ✅ **非阻塞架構**：user-core 失敗不影響主流程
3. ✅ **為未來鋪路**：為 snowbuddy-matching 整合做好準備
4. ✅ **可觀察性**：所有操作都有日誌紀錄

---

## 參考文檔

- [事件映射文檔](EVENT_MAPPING.md)
- [生產環境部署指南](PRODUCTION_DEPLOYMENT.md)
- [user-core API 文檔](https://user-core.zeabur.app/docs)

---

**最後更新**: 2025-12-05
**整合狀態**: ✅ 生產環境就緒
