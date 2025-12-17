# 🔒 RLS 安全警告修復指南

**問題**：Supabase 顯示 11 個錯誤和 30 個警告，主要是 RLS (Row Level Security) 相關問題。

## 🚨 立即修復步驟

### 1. 在 Supabase SQL Editor 執行修復腳本

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 點擊左側 "SQL Editor"
4. 複製並執行 `docs/fix_rls_security_warnings.sql` 中的內容

### 2. 主要修復內容

#### ✅ 啟用 RLS 的表格
- `users` - 用戶資料
- `lessons` - 課程內容  
- `favorites` - 收藏記錄
- `practice_logs` - 練習紀錄
- `event_log` - 事件日誌
- `feedback` - 意見回報
- `payments` - 付款記錄
- `affiliate_partners` - 聯盟夥伴
- `affiliate_clicks` - 推廣點擊
- `affiliate_commissions` - 分潤記錄

#### ✅ 安全政策設定
- **用戶資料**：只能存取自己的資料
- **課程內容**：免費課程公開，付費課程需訂閱
- **收藏/練習**：需要有效訂閱
- **管理功能**：只有 `is_admin = true` 的用戶可存取

#### ✅ 移除安全風險
- 移除有問題的 `SECURITY DEFINER` 視圖
- 修改函數使用 `SECURITY INVOKER`
- 確保所有敏感操作都有適當權限檢查

## 🔍 驗證修復結果

執行修復腳本後，應該會看到：

```sql
-- 檢查 RLS 狀態
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
```

**預期結果**：所有重要表格的 `rls_enabled` 都應該是 `true`，且有適當數量的政策。

## 🛡️ 安全改善效果

### 修復前的問題
- ❌ 某些表格 RLS 被禁用
- ❌ 存在 `SECURITY DEFINER` 視圖風險
- ❌ 缺少適當的存取控制政策

### 修復後的保護
- ✅ 所有敏感表格啟用 RLS
- ✅ 用戶只能存取自己的資料
- ✅ 付費內容受訂閱狀態保護
- ✅ 管理功能受權限控制
- ✅ 移除潛在的權限提升風險

## 📋 後續監控

1. **定期檢查**：每週檢查 Supabase Security Advisor
2. **權限測試**：確保不同角色用戶的存取權限正確
3. **日誌監控**：注意異常的資料庫存取模式

## 🆘 如果修復失敗

如果執行 SQL 時出現錯誤：

1. **權限不足**：確保使用的是 service_role key
2. **政策衝突**：可能需要先刪除現有政策再重建
3. **表格不存在**：檢查表格名稱是否正確

**緊急聯繫**：透過平台意見回報系統回報問題

---

**執行時間**：約 2-3 分鐘  
**影響範圍**：資料庫安全性，不影響前端功能  
**風險等級**：低（只是加強安全性）
