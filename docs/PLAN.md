# 單板教學 App - 開發計畫 (PWA 版)

> "Talk is cheap. Show me the code." - Linus

## 總覽

```
Week 1: PWA 基礎（首頁 + 詳情）
Week 2: 用戶系統（登入 + 收藏）
Week 3: 付費功能（Premium）
```

---

## 技術棧

| 項目 | 選擇 | 原因 |
|------|------|------|
| 框架 | Next.js 14 | App Router、手機優先 |
| 樣式 | Tailwind CSS | 快速、響應式 |
| 後端 | Supabase | 已設定好 |
| 部署 | Zeabur | 已設定好 |

---

## 保留資產

- ✅ `lessons.json` - 211 筆資料
- ✅ Supabase 專案 - auth、favorites、practice_logs 表
- ✅ Zeabur 專案 - 部署設定

## 丟掉

- ❌ `app.py` - Streamlit
- ❌ `auth.py` - Python 版
- ❌ `supabase_client.py` - Python 版

---

## Week 1: PWA 基礎

| 任務 | 驗收標準 |
|------|---------|
| Next.js 專案 | `npm run dev` 可執行 |
| Tailwind 設定 | 深色主題生效 |
| 首頁 | 顯示 211 筆卡片 |
| 搜尋 | 輸入關鍵字即時篩選 |
| 篩選 | 程度/雪道/技能 |
| 詳情頁 | 問題/目標/方法/訊號 |
| PWA | 可加到主畫面 |
| 部署 | Zeabur 自動部署 |

---

## Week 2: 用戶系統

| 任務 | 驗收標準 |
|------|---------|
| 登入頁 | Email + 密碼 |
| 註冊 | 成功後可登入 |
| 登出 | 清除 session |
| 收藏按鈕 | 點擊變 ❤️ |
| 收藏列表 | 顯示我的收藏 |
| 練習紀錄 | 「練完了」+ 評分 |

---

## Week 3: 付費功能

| 任務 | 驗收標準 |
|------|---------|
| 內容分層 | Free 50 筆 / Premium 161 筆 |
| 鎖定 UI | Premium 內容顯示 🔒 |
| 付費頁 | 價格 + 轉帳資訊 |
| 手動開通 | 後台更新 is_premium |

---

## 不做的事

| 功能 | 原因 |
|------|------|
| Google 登入 | Email 夠用 |
| 金流整合 | 先驗證付費意願 |
| 趨勢圖 | 過度設計 |
| AI 圖片 | 不影響核心價值 |

---

## 成功標準

- Week 1：手機可正常使用，可加到主畫面
- Week 2：可登入、收藏、記錄練習
- Week 3：有人願意付費
