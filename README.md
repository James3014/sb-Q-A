# 🏂 單板教學 App

滑雪板教學內容管理系統，基於 CASI 認證教學框架。專為雪場使用設計，手機優先的 UI。

## 🎯 使用情境

- 🚡 纜車上快速查找問題解法
- 🧤 戴手套操作（大按鈕、大觸控區）
- ☀️ 強光下閱讀（高對比深色主題）
- ⏱️ 找到問題 → 看解法 → 馬上練

## 🚀 快速啟動

```bash
cd /Users/jameschen/Downloads/單板教學
source .venv/bin/activate
streamlit run app.py --server.address 0.0.0.0 --server.port 8501
```

手機存取：`http://<你的電腦IP>:8501`（需同一 WiFi）

## 📱 功能特色

### 首頁（列表）

| 功能 | 說明 |
|------|------|
| 🔍 搜尋 | 關鍵字搜尋問題、標題、目標 |
| 篩選-程度 | 初級 / 中級 / 進階 |
| 篩選-雪道 | 綠道 / 藍道 / 黑道 / 蘑菇 / 粉雪 / 公園 / 樹林 |
| 篩選-技能 | CASI 五項核心技能 |
| 問題優先 | 卡片最上方顯示問題，快速對號入座 |

### 詳情頁

| 區塊 | 內容 |
|------|------|
| 😰 問題 | 學生常見的技術問題描述 |
| 🎯 目標 | 改善這個問題的目的或好處 |
| 🛠️ 怎麼練 | 具體的動作要點或練習步驟 |
| ✅ 做對訊號 | 練習正確時的身體感受或視覺回饋 |
| ❌ 做錯訊號 | 練習錯誤時的警示訊號 |
| 📚 CASI 分類 | 主要技能、核心能力分類 |

### CASI 五項核心技能

1. **站姿與平衡** - 居中且靈活的站姿
2. **旋轉** - 用下肢轉動滑雪板
3. **用刃** - 在有效邊刃上保持平衡
4. **壓力** - 控制板的壓力與變形
5. **時機與協調性** - 動作時序與流暢度

## 📁 專案結構

```
單板教學/
├── app.py              # Streamlit UI（手機優先）
├── app_logic.py        # 篩選邏輯（與 UI 分離）
├── converter.py        # Markdown → JSON 轉換器
├── lessons.json        # 211 筆結構化教學資料
├── sam_cleaned/        # 原始教學 Markdown 檔案
│   └── *.md           # 教學練習文件
├── test_app.py         # 邏輯層測試
├── test_converter.py   # 轉換器測試
├── ui_mockup.md        # UI 設計文件
└── .venv/              # Python 虛擬環境
```

## 📊 資料格式

每筆教學資料結構：

```json
{
  "id": "01",
  "title": "滾刃快換刃：少站直縮小弧度",
  "level_tags": ["intermediate"],
  "slope_tags": ["blue"],
  "what": "問題描述...",
  "why": ["目標1", "目標2"],
  "how": [
    {"text": "步驟說明", "image": null}
  ],
  "signals": {
    "correct": ["做對訊號1", "做對訊號2"],
    "wrong": ["做錯訊號1"]
  },
  "casi": {
    "Primary_Skill": "用刃",
    "Core_Competency": "居中且靈活的站姿"
  }
}
```

## 🔧 開發指令

### 重新轉換 Markdown

當 `sam_cleaned/*.md` 有更新時：

```bash
source .venv/bin/activate
python converter.py
```

### 執行測試

```bash
python test_converter.py
python test_app.py
```

## 📈 統計

- 教學文件總數：211 個
- 程度分類：初級 / 中級 / 進階
- 雪道分類：9 種（綠道、藍道、黑道、蘑菇、粉雪、公園、樹林、平地、全地形）
- CASI 技能：5 項

## 🗺️ 未來規劃

- [ ] 用戶系統（登入/註冊）
- [ ] 收藏功能
- [ ] 練習紀錄追蹤
- [ ] 個人儀表板（趨勢圖）
- [ ] Premium 訂閱
- [ ] AI 示意圖
- [ ] 改善計畫課程
- [ ] CASI Level 2/3 深度內容

## 📚 開發文件

| 文件 | 說明 |
|------|------|
| [SDD.md](docs/SDD.md) | 軟體設計文件 |
| [PLAN.md](docs/PLAN.md) | 開發計畫 |
| [TODO.md](docs/TODO.md) | 待辦清單 |
| [schema.sql](docs/schema.sql) | 資料庫 Schema |
| [ui_mockup.md](ui_mockup.md) | UI 設計文件 |

---

*最後更新：2025-11-26*
