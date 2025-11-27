# Learning Path Engine 規格文件

## 概述

Learning Path Engine 根據騎手狀態（程度、症狀、目標、已完成課程）產生個人化學習路徑。

## 架構

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│  web/src/lib/path/computeClientPath.ts                  │
│  - 前端呈現/排序/UI 轉換                                  │
└─────────────────────┬───────────────────────────────────┘
                      │ invoke
┌─────────────────────▼───────────────────────────────────┐
│              Supabase Edge Function                      │
│  supabase/functions/recommend-path/                      │
│  ├── index.ts      # 入口                                │
│  ├── types.ts      # 型別定義                            │
│  ├── score.ts      # 過濾 + 評分                         │
│  └── schedule.ts   # 排程 + 摘要                         │
└─────────────────────┬───────────────────────────────────┘
                      │ query
┌─────────────────────▼───────────────────────────────────┐
│                    Supabase DB                           │
│  lessons, skills, lesson_skills, lesson_prerequisites    │
└─────────────────────────────────────────────────────────┘
```

## API

### POST /functions/v1/recommend-path

**Request:**
```json
{
  "riderState": {
    "profile": {
      "id": "user-123",
      "level": "intermediate",
      "preferredTerrain": ["blue", "black"],
      "avoidTerrain": ["park"],
      "goals": ["control_speed", "moguls_intro"]
    },
    "symptoms": [
      { "code": "rear_seat", "description": "後座", "severity": 2 },
      { "code": "ice_chatter", "description": "冰面抖", "severity": 1 }
    ],
    "completedLessons": [
      { "lessonId": "01", "status": "completed", "completedAt": "2024-01-15" }
    ]
  },
  "options": {
    "days": 2,
    "perDayLessonCount": 4
  }
}
```

**Response:**
```json
{
  "riderId": "user-123",
  "items": [
    {
      "lessonId": "25",
      "lessonTitle": "冰蘑菇居中挺棱",
      "intent": "build",
      "dayIndex": 1,
      "orderInDay": 1,
      "mustDo": true,
      "rationale": ["針對問題：後座、冰面抖", "符合學習目標"],
      "estimatedMin": 15
    }
  ],
  "summary": "根據你的問題（後座、冰面抖）和目標（control_speed、moguls_intro），推薦 2 天共 8 堂課程。",
  "totalDays": 2,
  "totalLessons": 8,
  "generatedAt": "2024-01-20T10:30:00Z"
}
```

## 演算法

### Step 1: filterCandidates

過濾不適合的課程：
- 排除已完全掌握（completed + 無 stillWrongSignals）
- **排除 hard prerequisite 未完成的課程**
- 排除超出程度（beginner 不看 advanced）
- 排除迴避地形

### Prerequisites 處理

| 類型 | 說明 | 處理方式 |
|------|------|----------|
| `hard` | 必須先完成 | filterCandidates 直接排除 |
| `soft` | 建議先完成 | scoreLessons 加分/扣分 |

- Hard prerequisite 未完成 → 課程不會出現在候選
- Soft prerequisite 已完成 → +2 分
- Soft prerequisite 未完成 → -1 分

### Step 2: scoreLessons

多維度評分（總分 = 加權總和）：

| 維度 | 權重 | 計算方式 |
|------|------|----------|
| levelMatch | ×2 | 程度完全符合 = 3，部分符合 = 1 |
| goalMatch | ×3 | 技能符合 +2，地形符合 +3，上限 5 |
| symptomMatch | ×3 | 關鍵字命中 × severity，上限 5 |
| terrainMatch | ×1 | 偏好地形命中 = 1 |
| novelty | ×1 | 2 天內做過 = -3 |

### Step 3: schedulePath

排程邏輯：
1. 每天選 N 堂課（預設 4）
2. **Day 1 第一堂插入 warm-up**（如果有且 `includeWarmup: true`）
3. 第一堂正式課為 `build`（核心課程）
4. symptomMatch > 2 為 `diagnose`
5. 其餘為 `apply`

### Warm-up 識別

關鍵字匹配：`平地`、`站姿`、`居中`、`企鵝`、`基礎`

符合的課程會被標記為 `isWarmup: true`，排程時優先插入 Day 1 第一堂。

### Step 4: buildSummary

產生人類可讀摘要。

## Symptom Codes

| Code | 描述 | 關鍵字 |
|------|------|--------|
| rear_seat | 後座 | 後座、後腳、後重、壓後、重心後 |
| fear_speed | 怕速度 | 控速、減速、速度、煞車、太快 |
| ice_chatter | 冰面抖 | 冰面、抖、震動、突突、硬雪 |
| edge_stuck | 換刃卡 | 換刃、卡、卡頓、不順 |
| mogul_fear | 蘑菇恐懼 | 蘑菇、包、mogul |
| weak_toeside | 前刃弱 | 前刃弱、前刃不穩 |
| weak_heelside | 後刃弱 | 後刃弱、後刃不穩 |
| standing_tall | 站太直 | 站直、站太直、起身 |
| counter_rotation | 上下分離 | 反擰、上下分離、扭曲 |
| locked_knees | 膝蓋鎖死 | 膝蓋、鎖死、膝直 |

## Goal Codes

| Code | 對應技能 |
|------|----------|
| control_speed | PRESSURE_CONTROL, TIMING_COORD |
| moguls_intro | PRESSURE_CONTROL, TIMING_COORD |
| powder_intro | STANCE_BALANCE, PRESSURE_CONTROL |
| ice_stability | EDGE_CONTROL, STANCE_BALANCE |
| park_intro | TIMING_COORD, ROTATION |
| carving_intro | EDGE_CONTROL, PRESSURE_CONTROL |
| general_progress | STANCE_BALANCE, EDGE_CONTROL |

## Intent 類型

| Intent | 說明 |
|--------|------|
| warmup | 暖身練習（Day 1 第一堂） |
| diagnose | 診斷問題（針對症狀） |
| build | 核心建構（每天第一堂正式課） |
| apply | 應用練習 |
| recover | 恢復/複習（未來擴充） |

## 前端使用

```typescript
import { supabase } from '@/lib/supabase'

const { data } = await supabase.functions.invoke('recommend-path', {
  body: { riderState, options: { days: 1, perDayLessonCount: 4 } }
})

// data.items 為排序好的課程清單
```

## Persona 範例

### Persona A：中級怕速度

```json
{
  "profile": {
    "id": "user-a",
    "level": "intermediate",
    "preferredTerrain": ["blue"],
    "avoidTerrain": ["black", "mogul"],
    "goals": ["control_speed"]
  },
  "symptoms": [
    { "code": "fear_speed", "description": "怕速度", "severity": 3 },
    { "code": "standing_tall", "description": "站太直", "severity": 2 }
  ],
  "completedLessons": []
}
```

**預期輸出：**
- 優先推薦控速相關課程（煞車、減速、Speed Check）
- 避開黑道和蘑菇課程
- 插入站姿修正課程

---

### Persona B：進階冰面不穩

```json
{
  "profile": {
    "id": "user-b",
    "level": "advanced",
    "preferredTerrain": ["blue", "black"],
    "goals": ["ice_stability", "carving_intro"]
  },
  "symptoms": [
    { "code": "ice_chatter", "description": "冰面抖", "severity": 2 },
    { "code": "weak_heelside", "description": "後刃弱", "severity": 1 }
  ],
  "completedLessons": [
    { "lessonId": "01", "status": "completed" },
    { "lessonId": "10", "status": "completed" }
  ]
}
```

**預期輸出：**
- 優先推薦冰面技巧（冰面搓雪、膝前壓穩板底）
- 後刃強化課程
- 刻滑入門課程

---

### Persona C：初學蘑菇入門

```json
{
  "profile": {
    "id": "user-c",
    "level": "intermediate",
    "preferredTerrain": ["blue", "mogul"],
    "goals": ["moguls_intro"]
  },
  "symptoms": [
    { "code": "mogul_fear", "description": "蘑菇恐懼", "severity": 2 },
    { "code": "rear_seat", "description": "後座", "severity": 1 }
  ],
  "completedLessons": []
}
```

**預期輸出：**
- 優先推薦蘑菇入門（走側壁、減速停點）
- 修正後座問題
- 團身換刃相關課程

---

## 未來擴充

- [x] Prerequisites 檢查（hard/soft）
- [x] Warm-up 自動插入
- [ ] Skill graph 權重計算
- [ ] 學習進度追蹤
- [ ] A/B 測試不同演算法
