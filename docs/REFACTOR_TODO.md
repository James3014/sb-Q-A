# 重構清單 - 收藏與練習紀錄功能

## 重構完成項目

| # | 任務 | 狀態 |
|---|------|------|
| 1 | 修復 Supabase client，確保 session 正確傳遞 | ✅ |
| 2 | 加入 debug log 確認 auth 狀態 | ✅ |
| 3 | 簡化 favorites 邏輯（add/remove 分開） | ✅ |
| 4 | 加入錯誤處理和用戶提示 | ✅ |
| 5 | Build 測試通過 | ✅ |

## 修改內容

### supabase.ts
- 改名 `getSupabase()` 更清晰
- 加入 console.error 當環境變數缺失

### auth.ts
- 所有函數加入錯誤 log
- `onAuthStateChange` 加入狀態變化 log
- 新增 `getSession()` 函數

### favorites.ts
- 移除 `toggleFavorite`，改回 `addFavorite` / `removeFavorite`
- 每個操作前檢查 session 是否有效
- 加入詳細 console.log 方便 debug
- 返回 `{ success, error }` 格式

### practice.ts
- 操作前檢查 session
- 加入錯誤處理和 log
- 返回 `{ success, error }` 格式

### LessonDetail.tsx
- 分離 favLoading / favError 狀態
- 分離 noteStatus / noteError 狀態
- 顯示錯誤訊息給用戶
- 按鈕 disabled 狀態更完整

### AuthProvider.tsx
- 加入初始化和狀態變化的 log

## 待測試
- [ ] 登入後收藏功能
- [ ] 登入後練習紀錄功能
