# Lesson CMS UI 改善建議

基於 Square UI 設計系統的參考，針對當前 Lesson CMS 後台的改善建議。

## 🎯 改善重點

### 1. 統計儀表板優化

**當前狀況**：基本的數字顯示
**Square UI 參考**：現代化統計卡片 + 趨勢圖表

**建議改善**：
```tsx
// 新增統計卡片組件
export function StatsCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon 
}: StatsCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <div className="flex items-center gap-1 text-sm">
            <span className={`${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {change}
            </span>
            <span className="text-zinc-500">vs 上月</span>
          </div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}
```

### 2. 課程管理表格優化

**當前狀況**：基本表格設計
**Square UI 參考**：現代化表格 + 狀態標籤 + 操作按鈕

**建議改善**：
- ✅ 添加頭像/縮圖欄位
- ✅ 改善狀態標籤設計
- ✅ 添加快速操作按鈕
- ✅ 添加分頁功能
- ✅ 添加搜尋/篩選功能

```tsx
// 改善後的表格設計
<tr className="hover:bg-zinc-800/50 transition-colors">
  <td className="px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
        {lesson.title.charAt(0)}
      </div>
      <div>
        <div className="font-semibold text-white">{lesson.title}</div>
        <div className="text-xs text-zinc-400">ID: {lesson.id}</div>
      </div>
    </div>
  </td>
  <td className="px-4 py-3">
    <div className="flex gap-1">
      {lesson.level_tags?.map(tag => (
        <span key={tag} className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
          {tag}
        </span>
      ))}
    </div>
  </td>
  <td className="px-4 py-3">
    <span className={`px-2 py-1 text-xs rounded-full ${
      lesson.is_published 
        ? 'bg-emerald-500/20 text-emerald-300' 
        : 'bg-zinc-700 text-zinc-300'
    }`}>
      {lesson.is_published ? '已發布' : '草稿'}
    </span>
  </td>
</tr>
```

### 3. 課程編輯器優化

**當前狀況**：基本表單設計
**Square UI 參考**：現代化表單 + 拖拉排序 + 即時預覽

**建議改善**：
- ✅ 添加側邊預覽面板
- ✅ 改善拖拉排序視覺效果
- ✅ 添加進度保存指示器
- ✅ 改善圖片上傳區域設計

### 4. 分析圖表優化

**當前狀況**：基本圖表
**Square UI 參考**：多維度圖表 + 互動式設計

**建議改善**：
```tsx
// 新增課程效能分析組件
export function LessonPerformanceChart({ data }: { data: LessonStat[] }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">課程效能分析</h3>
      <div className="space-y-4">
        {data.map(lesson => (
          <div key={lesson.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {lesson.title.charAt(0)}
              </div>
              <span className="text-white">{lesson.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-white">{lesson.views}</div>
                <div className="text-xs text-zinc-400">瀏覽</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{lesson.practices}</div>
                <div className="text-xs text-zinc-400">練習</div>
              </div>
              <div className="w-20 bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${(lesson.practices / lesson.views) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🚀 實作優先級

### Phase 1: 基礎視覺優化 (1-2 天)
1. **統計卡片重設計** - 參考 Square UI 的卡片設計
2. **表格視覺優化** - 添加頭像、改善狀態標籤
3. **按鈕和互動元素** - 統一設計語言

### Phase 2: 功能增強 (2-3 天)
1. **搜尋和篩選** - 添加即時搜尋功能
2. **分頁和排序** - 改善大量資料處理
3. **批次操作** - 多選刪除、批次發布

### Phase 3: 進階分析 (3-4 天)
1. **互動式圖表** - 使用 Recharts 或 Chart.js
2. **即時數據更新** - WebSocket 或 Server-Sent Events
3. **匯出功能** - PDF/Excel 報告生成

## 🎨 設計系統統一

### 顏色系統
```css
/* 參考 Square UI 的顏色系統 */
:root {
  --primary-blue: #3b82f6;
  --primary-purple: #8b5cf6;
  --success-green: #10b981;
  --warning-yellow: #f59e0b;
  --error-red: #ef4444;
  --zinc-900: #18181b;
  --zinc-800: #27272a;
  --zinc-700: #3f3f46;
}
```

### 組件庫擴展
```tsx
// 統一的設計組件
export const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
    {children}
  </div>
)

export const Badge = ({ variant, children }) => (
  <span className={`px-2 py-1 text-xs rounded-full ${badgeVariants[variant]}`}>
    {children}
  </span>
)

export const Button = ({ variant, size, children, ...props }) => (
  <button className={`${buttonVariants[variant]} ${buttonSizes[size]}`} {...props}>
    {children}
  </button>
)
```

## 📱 響應式設計

### 移動端優化
- **觸控友好** - 按鈕最小 44px
- **滑動操作** - 表格水平滾動
- **摺疊面板** - 複雜表單分段顯示

### 平板端優化
- **側邊欄摺疊** - 更多內容空間
- **網格佈局** - 統計卡片 2x2 排列

## 🔧 技術實作建議

### 1. 組件重構
```bash
# 建立新的設計系統組件
mkdir -p web/src/components/ui/modern
# Card, Badge, Button, Table, Chart 等
```

### 2. 樣式系統
```bash
# 擴展 Tailwind 配置
# 添加自定義顏色、動畫、陰影
```

### 3. 圖表庫整合
```bash
npm install recharts
# 或 npm install chart.js react-chartjs-2
```

## 📊 預期效果

### 使用者體驗提升
- **視覺層次更清晰** - 重要資訊突出顯示
- **操作更直觀** - 減少點擊次數
- **載入更流暢** - 骨架屏和漸進載入

### 管理效率提升
- **資料洞察更深入** - 多維度分析圖表
- **批次操作更便利** - 減少重複工作
- **搜尋更精準** - 多條件篩選

### 技術債務減少
- **組件復用性提高** - 統一設計系統
- **維護成本降低** - 標準化組件庫
- **擴展性更好** - 模組化架構

---

**參考資源**：
- [Square UI Dashboard 1](https://square-ui-dashboard-1.vercel.app)
- [Square UI Dashboard 2](https://square-ui-dashboard-2.vercel.app)
- [Square UI GitHub](https://github.com/ln-dev7/square-ui)
- [shadcn/ui 組件庫](https://ui.shadcn.com)

**實作時程**：預計 6-9 天完成所有改善項目
**優先級**：Phase 1 > Phase 2 > Phase 3
