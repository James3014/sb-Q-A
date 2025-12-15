# 課程內容管理系統 (Lesson CMS) 實作計畫

## 概述

為練習內容建立簡易後台編輯系統,支援文字編輯、圖片上傳、AI 內容生成預留。

### 核心決策

1. **技術棧**: 繼續使用 Supabase PostgreSQL (不引入 Payload CMS/MongoDB)
2. **使用者**: 僅管理員單人使用,無需複雜權限系統
3. **開發時間**: 1-2週快速上線 (分3個Phase漸進式實作)
4. **AI整合**: 暫不實作,但預留介面與欄位設計

### 為什麼不用 Payload CMS?

- 技術棧不匹配 (Payload 預設 MongoDB)
- 過度工程 (單人使用不需複雜 CMS)
- 維護成本高 (需額外部署與管理)

---

## 資料庫 Schema 變更

### 擴充 lessons 表

```sql
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 觸發器自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Supabase Storage 配置

**Bucket**: `lesson-images`

**路徑結構**:
```
lesson-images/
├── {lessonId}/step-0.jpg
├── {lessonId}/step-1.jpg
└── temp/{uploadId}.jpg      # 建立模式暫存
```

**RLS Policy**:
```sql
-- 讀取: 所有人
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'lesson-images');

-- 上傳: 管理員
CREATE POLICY "Admin upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-images' AND
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);

-- 刪除: 管理員
CREATE POLICY "Admin delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lesson-images' AND
  auth.uid() IN (SELECT id FROM users WHERE is_admin = true)
);
```

---

## API 路由設計

```
/api/admin/lessons/
├── GET    /api/admin/lessons          # 現有 - 統計分析
├── GET    /api/admin/lessons/[id]     # 新增 - 單筆詳情
├── POST   /api/admin/lessons          # 新增 - 建立課程
├── PATCH  /api/admin/lessons/[id]     # 新增 - 更新課程
├── DELETE /api/admin/lessons/[id]     # 新增 - 軟刪除
└── POST   /api/admin/upload           # 新增 - 圖片上傳
```

---

## 頁面路由設計

```
/admin/lessons/
├── /admin/lessons                     # 改造 - 新增 'manage' tab
├── /admin/lessons/create              # 新增 - 建立頁面
└── /admin/lessons/[id]/edit           # 新增 - 編輯頁面
```

---

## 實作優先順序 (3 Phases)

### Phase 1: MVP CRUD (3-5天)

**目標**: 基礎增刪改查,純文字欄位

**檔案變更**:
```
web/src/app/api/admin/lessons/
├── [id]/route.ts              # 新增 - GET/PATCH/DELETE
└── route.ts                   # 修改 - 新增 POST

web/src/app/admin/lessons/
├── page.tsx                   # 修改 - 新增 'manage' tab
├── create/page.tsx            # 新增
└── [id]/edit/page.tsx         # 新增

web/src/components/admin/
├── LessonManageTable.tsx      # 新增 - 課程列表表格
└── LessonForm.tsx             # 新增 - 共用表單組件

web/src/lib/
├── adminData.ts               # 修改 - 新增 CRUD 函數
└── adminApi.ts                # 修改 - 新增 adminPatch/adminDelete
```

**表單欄位 (Phase 1)**:
- `title` - 文字輸入
- `what` - 多行文字框
- `is_premium` - 勾選框
- `level_tags` - 逗號分隔輸入 (暫時)
- `slope_tags` - 逗號分隔輸入 (暫時)

**API 實作範例** (`POST /api/admin/lessons`):
```typescript
export async function POST(req: NextRequest) {
  const { supabase, error } = await authorizeAdmin(req)
  if (error) return error

  const body: CreateLessonRequest = await req.json()

  // 驗證必填欄位
  if (!body.title || !body.what || !body.level_tags?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // 生成課程 ID
  const lessonId = `L-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const { data, error: insertError } = await supabase
    .from('lessons')
    .insert({
      id: lessonId,
      ...body,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ lesson: data })
}
```

---

### Phase 2: 圖片上傳 (2-3天)

**目標**: Supabase Storage 整合,圖片管理

**新增檔案**:
```
web/src/app/api/admin/upload/route.ts
web/src/components/admin/ImageUploadZone.tsx
web/src/lib/imageUtils.ts                    # 壓縮/驗證工具
```

**上傳流程**:
```
用戶選擇檔案
  ↓
前端壓縮 (Canvas API, max 1200px)
  ↓
POST /api/admin/upload
  ↓
後端驗證 (jpg/png/webp, <5MB)
  ↓
上傳到 Supabase Storage
  ↓
返回公開 URL
  ↓
更新 form state
```

**ImageUploadZone 組件**:
```tsx
function ImageUploadZone({ onUpload, currentImage }: Props) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      await uploadImage(file)
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 ${
        dragging ? 'border-blue-400' : 'border-zinc-600'
      }`}
    >
      {currentImage ? (
        <img src={currentImage} className="max-h-48" />
      ) : (
        <input type="file" accept="image/*" />
      )}
    </div>
  )
}
```

---

### Phase 3: 進階編輯 (2-3天)

**目標**: 富文本編輯器,陣列欄位 UI,拖拉排序

**技術選型**:

#### 富文本編輯器: Tiptap ✅

**依賴**:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

**理由**:
- 輕量 (~50KB)
- React 原生整合
- 支援 Markdown
- AI 整合友好

**配置**:
```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: true,
        orderedList: true,
        bold: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <div className="border border-zinc-600 rounded-lg">
      <div className="border-b p-2 flex gap-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
      </div>
      <EditorContent editor={editor} className="p-4 min-h-[200px]" />
    </div>
  )
}
```

#### 陣列欄位 UI: 自訂組件

**ArrayInputField** (用於 `why`, `signals.correct`, `signals.wrong`):
```tsx
function ArrayInputField({ value, onChange, placeholder }: Props) {
  const addItem = () => onChange([...value, ''])
  const removeItem = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  return (
    <div className="space-y-2">
      {value.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            className="flex-1 px-3 py-2 bg-zinc-700 rounded"
          />
          <button onClick={() => removeItem(idx)}>🗑️</button>
        </div>
      ))}
      <button onClick={addItem}>+ 新增</button>
    </div>
  )
}
```

**ChipInput** (用於 `level_tags`, `slope_tags`):
```tsx
function ChipInput({ value, onChange, options }: Props) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter(t => t !== tag))
    } else {
      onChange([...value, tag])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => toggle(option.value)}
          className={`px-3 py-1 rounded-full ${
            value.includes(option.value)
              ? 'bg-blue-600'
              : 'bg-zinc-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
```

#### 拖拉排序: @dnd-kit

**依賴**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**StepEditor 組件**:
```tsx
import { DndContext } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'

function StepEditor({ steps, onChange }: Props) {
  const handleDragEnd = (event: any) => {
    // 排序邏輯
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={steps.map(s => s.id)}>
        {steps.map((step, idx) => (
          <SortableStepItem key={step.id} step={step} index={idx} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

**新增檔案**:
```
web/src/components/admin/
├── RichTextEditor.tsx
├── ArrayInputField.tsx
├── ChipInput.tsx
└── StepEditor.tsx
```

---

## AI 整合預留設計

### 欄位設計

**現有結構已經友好**:
- `what` → AI 可直接生成
- `why` → AI 輸出 JSON 陣列
- `how` → AI 輸出結構化步驟
- `signals` → AI 分類生成

**建議新增元資料欄位**:
```sql
ALTER TABLE lessons
ADD COLUMN ai_generated BOOLEAN DEFAULT false,
ADD COLUMN ai_metadata JSONB;  -- { model: 'gpt-4', prompt: '...', version: 1 }
```

### UI 預留

**建立頁面頂部**:
```tsx
<div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
  <h3 className="font-bold mb-2">🤖 AI 輔助生成(即將推出)</h3>
  <p className="text-sm text-zinc-400 mb-3">
    描述你想教的技巧,AI 將自動生成課程框架
  </p>
  <button disabled className="px-4 py-2 bg-zinc-700 rounded text-zinc-500">
    輸入技巧描述 →
  </button>
</div>
```

**每個富文本欄位旁**:
```tsx
<div className="flex justify-between items-center mb-2">
  <label>練習目標</label>
  <button className="text-xs text-blue-400 disabled" disabled>
    ✨ AI 優化(即將推出)
  </button>
</div>
```

### API 預留

**未來端點**:
```
POST /api/admin/ai/generate-lesson
  Body: { description: string, level: string }
  Response: { lesson: LessonFormData }

POST /api/admin/ai/improve-text
  Body: { text: string, field: 'what' | 'why' | 'how' }
  Response: { improved: string }
```

---

## 注意事項

### 資料遷移
- 執行 ALTER TABLE 前備份資料庫
- 新欄位使用 DEFAULT,不影響現有 211 筆課程
- `is_published` 預設 true,現有課程保持可見

### 圖片儲存成本
- Supabase Free Tier: 1GB storage
- 預估: 211課程 × 3圖 × 200KB ≈ 120MB
- 上傳時前端壓縮到 1200px width

### 安全性
- 後端儲存前使用 DOMPurify 清理
- Tiptap 輸出限制允許標籤白名單
- 所有 API 使用 `authorizeAdmin()` 驗證

---

## 關鍵檔案清單

### 參考檔案 (現有模式)

1. `/web/src/lib/adminGuard.ts` - 權限控制模式
2. `/web/src/app/api/admin/users/route.ts` - API 路由模式
3. `/web/src/components/affiliate/AffiliateForm.tsx` - 表單模式
4. `/web/src/lib/lessons.ts` - Lesson 型別定義
5. `/web/src/app/admin/lessons/page.tsx` - 現有統計頁面

### 需建立的檔案 (Phase 1)

```
web/src/app/api/admin/lessons/[id]/route.ts
web/src/app/admin/lessons/create/page.tsx
web/src/app/admin/lessons/[id]/edit/page.tsx
web/src/components/admin/LessonManageTable.tsx
web/src/components/admin/LessonForm.tsx
```

### 需建立的檔案 (Phase 2)

```
web/src/app/api/admin/upload/route.ts
web/src/components/admin/ImageUploadZone.tsx
web/src/lib/imageUtils.ts
```

### 需建立的檔案 (Phase 3)

```
web/src/components/admin/RichTextEditor.tsx
web/src/components/admin/ArrayInputField.tsx
web/src/components/admin/ChipInput.tsx
web/src/components/admin/StepEditor.tsx
```

---

## 實作原則 (Linus Style)

1. **資料結構優先**: lessons 表設計已優,JSONB 靈活但有清晰 schema
2. **消除特殊情況**: 圖片上傳統一處理,草稿即正式課程(用 is_published 區分)
3. **實用主義**: 單人管理員無需複雜權限系統,軟刪除優於硬刪除
4. **簡潔執念**: 每個 Phase 獨立可用,避免一次性大重構

---

## 總工時預估

- **Phase 1**: 3-5天 (基礎 CRUD)
- **Phase 2**: 2-3天 (圖片上傳)
- **Phase 3**: 2-3天 (富文本+進階 UI)
- **總計**: 7-11天 (1.5-2週)
