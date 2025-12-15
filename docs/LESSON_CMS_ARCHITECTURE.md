# 課程內容管理系統 (Lesson CMS) - 架構設計文件

## 1. 模組分解 (Modular Architecture)

### 核心原則
- **單一職責**: 每個模組只做一件事
- **解耦設計**: 模組間透過清晰的介面通信
- **關注點分離**: UI / Business Logic / Data Access 完全分離
- **可測試性**: 每個模組都應該能獨立測試

### 模組拓樸圖

```
┌─────────────────────────────────────────────────────────┐
│                   Pages (頁面)                           │
│  create/page.tsx    edit/[id]/page.tsx    page.tsx      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Components (UI 層)                         │
│  LessonForm.tsx  ImageUploadZone.tsx                   │
│  LessonManageTable.tsx  RichTextEditor.tsx             │
│  ArrayInputField.tsx  ChipInput.tsx                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Hooks (狀態管理層)                          │
│  useLessonForm.ts   useImageUpload.ts                  │
│  useFormValidation.ts                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Services (業務邏輯層)                      │
│  lessonService.ts   imageService.ts                     │
│  validationService.ts                                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              API Routes (API 層)                        │
│  /api/admin/lessons/*  /api/admin/upload                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│           Data Access (Supabase 層)                     │
│  lessonRepository.ts   imageRepository.ts               │
└──────────────────────────────────────────────────────────┘
```

---

## 2. 詳細模組設計

### 2.1 Data Access Layer (資料存取層)

**檔案**: `src/lib/lessons/repositories/`

```
lessonRepository.ts
├── getLessonById(id: string): Promise<Lesson>
├── getAllLessons(filter?: Filter): Promise<Lesson[]>
├── createLesson(data: CreateLessonInput): Promise<Lesson>
├── updateLesson(id: string, data: UpdateLessonInput): Promise<Lesson>
├── deleteLesson(id: string): Promise<void>
└── softDeleteLesson(id: string): Promise<void>

imageRepository.ts
├── uploadImage(file: File, path: string): Promise<string>
├── deleteImage(path: string): Promise<void>
└── getImageUrl(path: string): string
```

**設計原則**:
- Pure data access (無業務邏輯)
- 每個方法只做一件事
- 返回類型明確 (Promise<T>)
- 統一錯誤處理 (throw specific errors)

---

### 2.2 Service Layer (業務邏輯層)

**檔案**: `src/lib/lessons/services/`

```
lessonService.ts
├── createLessonWithValidation(input: CreateLessonInput): Promise<Lesson>
├── updateLessonWithValidation(id: string, input: UpdateLessonInput): Promise<Lesson>
├── publishLesson(id: string): Promise<void>
├── unpublishLesson(id: string): Promise<void>
└── validateLessonData(data: any): ValidationResult

imageService.ts
├── compressImage(file: File): Promise<File>
├── validateImageFile(file: File): ValidationResult
├── uploadAndLink(file: File, lessonId: string, stepIndex: number): Promise<string>
└── cleanupOldImage(oldUrl: string): Promise<void>

validationService.ts
├── validateLessonInput(data: any): { valid: boolean; errors: string[] }
├── validateLessonTitle(title: string): boolean
├── validateImageFile(file: File): boolean
└── validateArrayField(items: any[]): boolean
```

**設計原則**:
- Orchestrate data access & validation
- Pure functions (same input → same output)
- No side effects except DB/Storage operations
- Composable: small functions combine into larger ones

---

### 2.3 Hooks Layer (狀態管理層)

**檔案**: `src/hooks/lessons/`

```
useLessonForm.ts
├── state: { title, what, why, how, signals, ... }
├── handlers: { setTitle, addStep, removeStep, ... }
└── methods: { reset, submit, validate }

useImageUpload.ts
├── state: { uploading, progress, error }
├── handlers: { handleFileSelect, handleDrop, handleDelete }
└── methods: { compressAndUpload }

useFormValidation.ts
├── state: { errors: Record<string, string> }
├── handlers: { validateField, validateForm, clearError }
└── methods: { touchField }
```

**設計原則**:
- Custom hooks encapsulate component logic
- Separate state management from rendering
- Return only necessary methods & state
- Easy to test (jest.mock hooks)

---

### 2.4 Component Layer (UI 層)

**檔案**: `src/components/admin/lessons/`

```
LessonForm.tsx (Smart Component)
├── Props: { lessonId?: string; onSuccess: () => void }
├── Uses: useLessonForm, useImageUpload, useFormValidation
└── Renders: <LessonFormContent>

LessonFormContent.tsx (Presentational Component)
├── Props: { form, validation, image, ... }
├── Renders: <input>, <textarea>, <RichTextEditor>, etc
└── Handlers: onChange, onSubmit (delegated to parent)

RichTextEditor.tsx (Uncontrolled Component)
├── Props: { value, onChange, placeholder }
├── Uses: @tiptap/react, Tiptap extensions
└── Emits: onChange(html)

ImageUploadZone.tsx (Specialized Component)
├── Props: { value, onChange, lessonId }
├── Handles: drag-drop, file selection, preview
└── Emits: onChange(imageUrl)

ArrayInputField.tsx (Reusable Component)
├── Props: { value: string[], onChange, placeholder }
├── Features: add/remove/edit items
└── Used by: why, signals.correct, signals.wrong

ChipInput.tsx (Reusable Component)
├── Props: { value: string[], onChange, options }
├── Features: toggle selection from predefined list
└── Used by: level_tags, slope_tags
```

**設計原則**:
- Smart Components (有 logic)
- Presentational Components (純 UI)
- Props-based configuration (可復用)
- No direct Supabase calls (through props/callbacks)

---

### 2.5 API Routes (API 層)

**檔案**: `src/app/api/admin/lessons/`

```
route.ts (GET, POST)
├── GET: Query with filters, pagination
├── POST: Create new lesson

[id]/route.ts (GET, PATCH, DELETE)
├── GET: Fetch single lesson
├── PATCH: Update lesson
├── DELETE: Soft delete lesson

upload/route.ts (POST)
├── File validation
├── Image compression
├── Supabase Storage upload
```

**設計原則**:
- Request validation at entry point
- Response standardization: { ok, data?, error? }
- Error codes: 400/401/403/404/500
- All routes use `authorizeAdmin(req)`

---

### 2.6 Type Definitions (型別層)

**檔案**: `src/types/lessons.ts`

```typescript
export interface Lesson {
  id: string
  title: string
  what: string
  why: string[]
  how: { text: string; image?: string }[]
  signals: { correct: string[]; wrong: string[] }
  level_tags: string[]
  slope_tags: string[]
  casi?: Record<string, any>
  is_premium: boolean
  is_published: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateLessonInput {
  title: string
  what: string
  why: string[]
  how: { text: string; image?: string }[]
  signals: { correct: string[]; wrong: string[] }
  level_tags: string[]
  slope_tags: string[]
  is_premium: boolean
}

export type UpdateLessonInput = Partial<CreateLessonInput>

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface ImageUploadResult {
  url: string
  path: string
}
```

---

## 3. 資料流 (Data Flow)

### 建立課程流程 (Create Flow)

```
User Input (LessonForm.tsx)
    ↓
useLessonForm hook (state mgmt)
    ↓
useFormValidation hook (validation)
    ↓
onSubmit() → lessonService.createLessonWithValidation()
    ↓
POST /api/admin/lessons
    ↓
API route validation
    ↓
lessonService.processImages() (upload + move from temp)
    ↓
lessonRepository.createLesson() (DB insert)
    ↓
Response: { ok: true, lesson: {...} }
    ↓
useQuery refresh (SWR/React Query)
    ↓
Redirect to /admin/lessons
```

### 圖片上傳流程 (Image Upload Flow)

```
User drag-drops / selects image (ImageUploadZone.tsx)
    ↓
useImageUpload hook
    ↓
imageService.compressImage() (Canvas API)
    ↓
imageService.validateImageFile() (type, size)
    ↓
POST /api/admin/upload (FormData)
    ↓
API route: imageRepository.uploadImage() (Supabase Storage)
    ↓
Response: { url: "https://...", path: "lessons/..." }
    ↓
setFormData(prev => ({ ...prev, how: [...prev.how, { text, image: url }] }))
    ↓
UI preview rendered
```

---

## 4. 錯誤處理策略 (Error Handling)

### API 層錯誤

```typescript
try {
  const result = await lessonService.createLessonWithValidation(input)
  return NextResponse.json({ ok: true, lesson: result })
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 404 })
  }
  // Fallback
  return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
}
```

### Service 層錯誤

```typescript
export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}
```

### 前端錯誤

```typescript
const { data, error } = await lessonService.createLesson(input)

if (error) {
  if (error.name === 'ValidationError') {
    setFormErrors(error.errors)
  } else if (error.name === 'NotFoundError') {
    showErrorAlert('課程不存在')
  } else {
    showErrorAlert('系統錯誤,請稍後重試')
  }
}
```

---

## 5. 測試策略 (TDD)

### Unit Tests (單元測試)

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── lessonService.test.ts
│   │   ├── imageService.test.ts
│   │   └── validationService.test.ts
│   ├── repositories/
│   │   ├── lessonRepository.test.ts
│   │   └── imageRepository.test.ts
│   └── hooks/
│       ├── useLessonForm.test.ts
│       └── useFormValidation.test.ts
├── integration/
│   └── api/
│       ├── lessons.create.test.ts
│       ├── lessons.update.test.ts
│       └── upload.test.ts
└── e2e/
    └── lesson-cms.test.ts (Playwright)
```

### 測試金字塔

```
        /\
       /  \ E2E Tests (5%)
      /────\
     /      \
    /  Integration (15%)
   /────────\
  /          \
 / Unit Tests (80%)
/______________\
```

---

## 6. Clean Code 原則應用

### 命名規則

```typescript
// ❌ 不好
const h = async (d) => {
  const r = await api(d)
  return r
}

// ✅ 好
const createLessonWithValidation = async (input: CreateLessonInput): Promise<Lesson> => {
  const validationResult = await validateLessonInput(input)
  if (!validationResult.valid) {
    throw new ValidationError(validationResult.errors)
  }
  return lessonRepository.createLesson(input)
}
```

### 函數設計

```typescript
// ❌ 不好: 做太多事
async function saveLessonAndUploadImages(lesson, images, userId) {
  const validated = validateLesson(lesson)
  if (!validated) throw new Error('Invalid')

  const uploadedImages = await Promise.all(
    images.map(img => uploadToStorage(img))
  )

  const lessonData = { ...lesson, images: uploadedImages }
  const result = await db.insert(lessonData)

  await sendAnalytics(userId, 'lesson_created')
  return result
}

// ✅ 好: 單一職責
async function saveLessonWithImages(lesson: CreateLessonInput, images: File[]): Promise<Lesson> {
  const uploadedImages = await imageService.uploadImages(images)
  return lessonRepository.createLesson({ ...lesson, how: uploadedImages })
}

async function createLessonWorkflow(lesson: CreateLessonInput, images: File[], userId: string): Promise<Lesson> {
  const validated = await validationService.validateLessonInput(lesson)
  if (!validated.valid) throw new ValidationError(validated.errors)

  const savedLesson = await saveLessonWithImages(lesson, images)
  await analyticsService.trackLessonCreated(userId)

  return savedLesson
}
```

### 評論策略

```typescript
// ❌ 不好: 過度評論
// Add validation to the lesson input
if (!input.title) {
  throw new Error('Title is required')
}

// ✅ 好: 程式碼自己說話
function validateLessonTitle(title: string): void {
  if (!title) {
    throw new ValidationError({ title: '課程標題為必填項目' })
  }
}
```

---

## 7. Linus 原則應用

### 1. 好品味 (Good Taste)

```typescript
// ❌ 特殊情況堆積
if (type === 'create') {
  // ...
} else if (type === 'update') {
  // ...
} else if (type === 'delete') {
  // ...
}

// ✅ 統一介面
type LessonOperation = {
  execute(): Promise<Lesson>
  validate(): ValidationResult
  rollback(): Promise<void>
}

class CreateOperation implements LessonOperation { ... }
class UpdateOperation implements LessonOperation { ... }
class DeleteOperation implements LessonOperation { ... }
```

### 2. 永遠不破壞使用者空間 (Never Break Userspace)

```typescript
// 新增欄位時使用 DEFAULT
ALTER TABLE lessons
ADD COLUMN is_published BOOLEAN DEFAULT true;

// 現有課程保持可見 (is_published = true)
// 新課程可選擇不發布
```

### 3. 實用主義 (Pragmatism)

```typescript
// ✅ 解決實際問題
// 使用者只有單人管理員 → 無需複雜權限系統
// 只需 authorizeAdmin() 即可

// ✅ 軟刪除優於硬刪除 (可恢復)
// 新增 deleted_at 欄位,不物理刪除資料
```

### 4. 簡潔執念 (Simplicity)

```typescript
// ❌ 過度工程
const LessonForm = (props) => {
  const [state, dispatch] = useReducer(formReducer, initialState)
  const [cache, setCache] = useState({})
  // ... 複雜的狀態管理
}

// ✅ 簡潔設計
const LessonForm = (props) => {
  const form = useLessonForm(props.lessonId)
  const validation = useFormValidation(form.data)

  // 清楚: 表單、驗證、提交
  return <LessonFormContent form={form} validation={validation} />
}
```

---

## 8. 部署檢查清單

- [ ] 資料庫 migration: `ALTER TABLE lessons ...`
- [ ] Supabase Storage bucket: `lesson-images`
- [ ] RLS policies 設定
- [ ] API routes 實作並測試
- [ ] Components & Hooks 實作
- [ ] Pages 整合
- [ ] Unit tests coverage > 80%
- [ ] Integration tests 通過
- [ ] E2E tests 通過
- [ ] 程式碼審查 (code review)
- [ ] 手動測試檢查清單
- [ ] 部署到 staging 驗證
- [ ] 監控設定 (error logging)

