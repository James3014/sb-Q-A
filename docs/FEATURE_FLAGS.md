# 功能開關配置指南

## 調整③ 儀表板強化 - 啟用步驟

**狀態**: 代碼已推送，功能目前隱藏

**啟用日期**: Day 30（2025-12-30）

### 環境變數

```
NEXT_PUBLIC_ENABLE_ADJUSTMENT_3=true
```

### 啟用步驟

#### 在 Zeabur 上啟用

1. 進入 Zeabur Dashboard
2. 找到「單板教學」專案
3. 進入環境變數設定
4. 新增或修改：`NEXT_PUBLIC_ENABLE_ADJUSTMENT_3=true`
5. 保存並重新部署

#### 在 Vercel 上啟用

1. 進入 Vercel 專案設定
2. 找到 Settings → Environment Variables
3. 新增或修改：`NEXT_PUBLIC_ENABLE_ADJUSTMENT_3` = `true`
4. 保存並重新部署

### 啟用後的效果

- ✅ 「改善儀表板」標籤會出現
- ✅ PRO 用戶能看到練習頻率分析和進度曲線圖
- ✅ 免費用戶看到升級提示

### 相關文件

- **代碼**: `web/src/app/practice/page.tsx` (line 111)
- **公告**: `docs/DAY30_USER_ANNOUNCEMENT.md`

### 檢查清單

- [ ] Day 30 上午：設定環境變數
- [ ] Day 30 上午：確認代碼已重新部署
- [ ] Day 30 中午：發佈用戶公告
- [ ] Day 30 下午：監控用戶反應
