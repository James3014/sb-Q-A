# 🎨 AI 示意圖製作指南

## 📊 Phase 3：TOP 10 熱門課程示意圖

### 選擇標準
從後台 heatmap 數據選出：
- 瀏覽次數最高的 10 堂課
- 優先選擇初/中級課程（使用者最多）

### 預估 TOP 10（待確認實際數據）
1. 後刃卡住
2. 前刃抖動
3. 換刃不順
4. 壓力站太直
5. 小轉彎不穩
6. 重心後傾
7. 膝蓋鎖死
8. 上半身旋轉
9. 速度控制
10. 落葉飄基礎

---

## 🖼️ 圖片風格指南

### 風格：簡筆畫教學手冊風

| 項目 | 規格 |
|------|------|
| 風格 | 黑白線條簡筆畫 |
| 背景 | 純白或淺灰 |
| 人物 | 簡化火柴人 + 滑雪板 |
| 視角 | 側面或 3/4 視角 |
| 標註 | 箭頭標示動作方向 |
| 尺寸 | 800x600px |
| 格式 | PNG（透明背景）或 WebP |

### 為什麼選簡筆畫？
- ✅ 風格統一容易
- ✅ AI 生成品質穩定
- ✅ 深色主題下清晰
- ✅ 檔案小、載入快
- ✅ 專業教學感

---

## 📝 Prompt 標準化模板

### 基礎 Prompt 結構
```
A simple black and white line drawing illustration for snowboard instruction.
[動作描述]
Style: minimalist stick figure with snowboard, side view.
Clean white background, with directional arrows showing movement.
Educational diagram style, like a sports training manual.
```

### 範例 Prompt

#### 1. 後刃卡住
```
A simple black and white line drawing illustration for snowboard instruction.
A snowboarder on heelside edge, body leaning back too much, 
arms flailing for balance. Red X mark showing incorrect posture.
Style: minimalist stick figure with snowboard, side view.
Clean white background, with directional arrows showing movement.
Educational diagram style, like a sports training manual.
```

#### 2. 正確後刃姿勢
```
A simple black and white line drawing illustration for snowboard instruction.
A snowboarder on heelside edge with proper form: 
knees bent, hips forward, arms relaxed at sides.
Green checkmark showing correct posture.
Style: minimalist stick figure with snowboard, side view.
Clean white background, with directional arrows showing movement.
Educational diagram style, like a sports training manual.
```

#### 3. 換刃動作
```
A simple black and white line drawing illustration for snowboard instruction.
A sequence showing edge transition: 
1) heelside position 2) flat base 3) toeside position.
Arrows showing weight shift direction.
Style: minimalist stick figure with snowboard, front view.
Clean white background, with directional arrows showing movement.
Educational diagram style, like a sports training manual.
```

---

## 🔧 製作流程

### Step 1：選擇 AI 工具
推薦：
- Midjourney（品質最好）
- DALL-E 3（方便快速）
- Stable Diffusion（免費、可本地）

### Step 2：生成圖片
1. 使用標準化 Prompt
2. 生成 4 張變體
3. 選擇最清晰的一張

### Step 3：後製調整
1. 裁切到 800x600
2. 調整對比度（深色主題需要）
3. 轉換為 WebP 格式

### Step 4：上傳到 Supabase Storage
```
/lesson-images/{lesson_id}/step_{n}.webp
```

### Step 5：更新課程資料
```sql
UPDATE lessons 
SET how = jsonb_set(how, '{0,image}', '"https://xxx.supabase.co/storage/v1/object/public/lesson-images/01/step_1.webp"')
WHERE id = '01';
```

---

## 📅 執行計畫

| 週次 | 任務 |
|------|------|
| Week 1 | 確認 TOP 10 課程、測試 Prompt |
| Week 2 | 生成 10 堂課 × 3 步驟 = 30 張圖 |
| Week 3 | 後製 + 上傳 + 測試 |

---

## 💡 未來擴展

- 動態 GIF（展示連續動作）
- 影片片段（3-5 秒 loop）
- 3D 模型預覽
