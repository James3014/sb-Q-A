# 單板教學 App - 軟體設計文件 (SDD)

> Linus 原則：解決真問題，用最簡單的方式

## 1. 產品概述

### 1.1 定位
雪場現地練習查找工具。問題導向，快速找到解法。

### 1.2 核心價值
- 纜車上 30 秒找到練習
- 戴手套可操作
- 問題 → 解法 → 馬上練

### 1.3 使用者
| 對象 | 需求 |
|------|------|
| 初中級學生 | 找問題、看解法、記錄進度 |
| 進階學生 | 全部內容 + 追蹤改善 |

---

## 2. 系統架構

```
┌─────────────────────────────┐
│     Streamlit App           │
│  ├── 首頁（列表）           │
│  ├── 詳情頁                 │
│  ├── 收藏匣                 │
│  └── 我的練習               │
├─────────────────────────────┤
│         Supabase            │
│  ├── Auth                   │
│  ├── lessons (211筆)        │
│  ├── favorites              │
│  └── practice_logs          │
└─────────────────────────────┘
```

---

## 3. 資料模型（極簡版）

### lessons
```sql
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level_tags TEXT[],
  slope_tags TEXT[],
  what TEXT,
  why TEXT[],
  how JSONB,
  signals JSONB,
  casi JSONB,
  is_premium BOOLEAN DEFAULT false
);
```

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ
);
```

### favorites
```sql
CREATE TABLE favorites (
  user_id UUID REFERENCES users(id),
  lesson_id TEXT REFERENCES lessons(id),
  PRIMARY KEY (user_id, lesson_id)
);
```

### practice_logs
```sql
CREATE TABLE practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  lesson_id TEXT REFERENCES lessons(id),
  completed_at TIMESTAMPTZ DEFAULT now(),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5)  -- 單一評分，夠了
);
```

---

## 4. 功能清單

### Phase 1 ✅ 完成
- [x] 211 筆練習資料
- [x] 搜尋 + 篩選
- [x] 詳情頁

### Phase 2（3 週）
- [ ] 登入/註冊
- [ ] 收藏（一個按鈕）
- [ ] 練習紀錄（完成 +1）

### Phase 3（3 週）
- [ ] Free/Premium 分層
- [ ] 付費頁面
- [ ] 我的練習列表

---

## 5. 付費模型（極簡）

| 方案 | 價格 | 內容 |
|------|------|------|
| Free | 免費 | 50 筆 + 收藏 20 個 |
| Premium | NT$199/月 | 全部 211 筆 + 無限收藏 + 紀錄 |

沒有 Pro，沒有一次性購買。先驗證 Premium 有人買再說。

---

## 6. 不做的事

- ❌ 趨勢圖表（過度設計）
- ❌ 技能分布圓餅圖（沒人要看）
- ❌ AI 圖片（好看但不急）
- ❌ 改善計畫課程（等用戶要求）
- ❌ Level 2/3 獨立購買（複雜化付費）

---

## 7. 技術決策

| 決策 | 原因 |
|------|------|
| Streamlit | 快速迭代，驗證需求 |
| Supabase | Auth + DB 一站搞定 |
| 單一評分 | 戴手套按 3 個評分太蠢 |
| 無金流整合 | 先用轉帳，驗證付費意願 |
