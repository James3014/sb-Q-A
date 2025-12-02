# user-core 整合文檔

## 概述

本文檔說明單板教學應用如何與 user-core 服務整合，實現統一的用戶身份管理和跨專案數據共享。

## 整合架構

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

## 整合策略

### 混合架構原則

1. **保留 Supabase Auth**：所有認證流程保持不變
2. **非阻塞同步**：user-core 同步失敗不影響主流程
3. **漸進式整合**：分階段實施，風險可控
4. **向後兼容**：不破壞現有功能

### 資料分層

| 資料類型 | 存儲位置 | 說明 |
|---------|---------|------|
| 認證資訊 | Supabase Auth | Email, 密碼, Session |
| 用戶檔案 | user-core | 角色, 技能等級, 語言偏好 |
| 訂閱資訊 | Supabase | 單板教學特有的業務邏輯 |
| 行為事件 | user-core | 跨專案共享的事件追蹤 |
| 收藏/練習 | Supabase | 單板教學特有的功能資料 |

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

### Phase 2：事件同步（計劃中）

**範圍**：
- 課程瀏覽事件
- 練習完成事件
- 收藏操作事件

**需要修改**：
- `web/src/lib/analytics.ts` - 添加 user-core 事件同步

**實施步驟**：
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

### Phase 3：完整整合（計劃中）

**範圍**：
- 用戶資料雙向同步
- 批次處理優化
- 錯誤監控和重試機制

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

### 2. 測試事件同步（Phase 2 後）

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

所有錯誤都會記錄到瀏覽器控制台，格式：
```
[UserCoreSync] <錯誤類型>: <錯誤訊息>
```

## 性能考慮

### 同步策略

1. **非阻塞**：所有 user-core 調用都是異步的
2. **超時控制**：5 秒超時，避免長時間等待
3. **批次處理**：事件可以批次發送（Phase 3）
4. **失敗靜默**：失敗不影響用戶體驗

### 性能指標

| 操作 | 預期延遲 | 影響 |
|-----|---------|------|
| 用戶註冊 | +50-100ms | 極低 |
| 事件追蹤 | +50-100ms | 極低 |
| 批次事件 | 0ms（異步） | 無 |

## 未來規劃

### snowbuddy-matching 整合

user-core 的資料將用於：
1. **媒合算法**：基於技能等級、偏好雪場
2. **學習行為**：利用課程瀏覽、練習完成記錄
3. **教練學生媒合**：單板教學的教練可以找到學生

### 跨專案數據共享

其他專案可以通過 user-core 訪問：
- 用戶基本資料
- 滑雪技能等級
- 學習行為記錄
- 偏好設置

## 故障排除

### 檢查 user-core 服務狀態

```bash
curl https://user-core.zeabur.app/docs
```

### 檢查用戶是否同步

```bash
curl "https://user-core.zeabur.app/users/<user_id>"
```

### 檢查事件是否記錄

```bash
curl "https://user-core.zeabur.app/events?user_id=<user_id>&limit=10"
```

## 聯絡與支援

如有問題，請查看：
- user-core 文檔：`../user-core/`
- API 文檔：https://user-core.zeabur.app/docs
- 整合測試：`web/src/lib/__tests__/userCoreSync.test.ts`（待創建）

---

*最後更新：2025-12-02*
