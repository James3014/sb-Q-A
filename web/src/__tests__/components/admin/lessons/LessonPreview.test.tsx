/**
 * LessonPreview Component Tests
 *
 * 測試課程預覽組件的各種功能
 */

import { render, screen } from '@testing-library/react'
import { LessonPreview } from '@/components/admin/lessons/LessonPreview'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

const mockFormState: UseLessonFormState = {
  title: '基礎落葉飄技巧',
  what: '學習基本的落葉飄動作，掌握橫滑技巧',
  why: ['建立平衡感', '學習邊刃控制', '為轉彎做準備'],
  how: [
    { text: '選擇緩坡區域開始練習', image: 'https://example.com/step1.jpg' },
    { text: '保持後刃姿勢，身體微向山下傾' },
    { text: '交替壓腳跟和腳尖，左右橫移' },
  ],
  signals: {
    correct: ['能順暢橫移', '保持平衡不摔倒'],
    wrong: ['身體過度後仰', '速度控制不佳'],
  },
  level_tags: ['初學', 'green'],
  slope_tags: ['緩坡'],
  is_premium: false,
}

describe('LessonPreview', () => {
  describe('基本渲染', () => {
    it('應該渲染標題', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('基礎落葉飄技巧')).toBeInTheDocument()
    })

    it('應該渲染 WHAT 內容', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('學習基本的落葉飄動作，掌握橫滑技巧')).toBeInTheDocument()
    })

    it('應該顯示 "這個練習學什麼" 標題', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('這個練習學什麼')).toBeInTheDocument()
    })
  })

  describe('WHY 章節渲染', () => {
    it('應該渲染所有 WHY 項目', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('建立平衡感')).toBeInTheDocument()
      expect(screen.getByText('學習邊刃控制')).toBeInTheDocument()
      expect(screen.getByText('為轉彎做準備')).toBeInTheDocument()
    })

    it('應該顯示 "為什麼要練" 標題', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('為什麼要練')).toBeInTheDocument()
    })

    it('應該處理空的 WHY 陣列', () => {
      const emptyWhy = { ...mockFormState, why: [] }
      render(<LessonPreview formState={emptyWhy} />)
      expect(screen.getByText('為什麼要練')).toBeInTheDocument()
      // 應該顯示空狀態提示
      expect(screen.queryByText('建立平衡感')).not.toBeInTheDocument()
    })
  })

  describe('HOW 步驟渲染', () => {
    it('應該渲染所有步驟文字', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('選擇緩坡區域開始練習')).toBeInTheDocument()
      expect(screen.getByText('保持後刃姿勢，身體微向山下傾')).toBeInTheDocument()
      expect(screen.getByText('交替壓腳跟和腳尖，左右橫移')).toBeInTheDocument()
    })

    it('應該顯示 "怎麼練" 標題', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('怎麼練')).toBeInTheDocument()
    })

    it('應該顯示步驟編號', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('步驟 1')).toBeInTheDocument()
      expect(screen.getByText('步驟 2')).toBeInTheDocument()
      expect(screen.getByText('步驟 3')).toBeInTheDocument()
    })

    it('應該顯示步驟圖片（如果有）', () => {
      render(<LessonPreview formState={mockFormState} />)
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
      // Next.js Image 組件會轉換 src 為優化過的 URL
      expect(images[0]).toHaveAttribute('alt', '步驟 1')
    })

    it('應該不顯示圖片（如果步驟沒有圖片）', () => {
      render(<LessonPreview formState={mockFormState} />)
      // 第 2 和第 3 步驟沒有圖片，應該只有 1 張圖片
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(1)
    })
  })

  describe('SIGNALS 章節渲染', () => {
    it('應該渲染正確信號', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('能順暢橫移')).toBeInTheDocument()
      expect(screen.getByText('保持平衡不摔倒')).toBeInTheDocument()
    })

    it('應該渲染錯誤信號', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('身體過度後仰')).toBeInTheDocument()
      expect(screen.getByText('速度控制不佳')).toBeInTheDocument()
    })

    it('應該顯示 "做對/做錯的訊號" 標題', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('做對的訊號 ✅')).toBeInTheDocument()
      expect(screen.getByText('做錯的訊號 ❌')).toBeInTheDocument()
    })

    it('應該處理空的 signals', () => {
      const emptySignals = {
        ...mockFormState,
        signals: { correct: [], wrong: [] },
      }
      render(<LessonPreview formState={emptySignals} />)
      expect(screen.getByText('做對的訊號 ✅')).toBeInTheDocument()
      expect(screen.getByText('做錯的訊號 ❌')).toBeInTheDocument()
    })
  })

  describe('標籤渲染', () => {
    it('應該渲染等級標籤', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('初學')).toBeInTheDocument()
      expect(screen.getByText('green')).toBeInTheDocument()
    })

    it('應該渲染坡度標籤', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.getByText('緩坡')).toBeInTheDocument()
    })

    it('應該顯示 PRO 徽章（如果是付費課程）', () => {
      const premiumState = { ...mockFormState, is_premium: true }
      render(<LessonPreview formState={premiumState} />)
      expect(screen.getByText('PRO')).toBeInTheDocument()
    })

    it('應該不顯示 PRO 徽章（如果是免費課程）', () => {
      render(<LessonPreview formState={mockFormState} />)
      expect(screen.queryByText('PRO')).not.toBeInTheDocument()
    })

    it('應該處理空的標籤陣列', () => {
      const noTags = {
        ...mockFormState,
        level_tags: [],
        slope_tags: [],
      }
      render(<LessonPreview formState={noTags} />)
      // 應該正常渲染，不拋出錯誤
      expect(screen.getByText('基礎落葉飄技巧')).toBeInTheDocument()
    })
  })

  describe('樣式和類別', () => {
    it('應該套用卡片樣式', () => {
      const { container } = render(<LessonPreview formState={mockFormState} />)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
    })

    it('應該使用深色主題', () => {
      const { container } = render(<LessonPreview formState={mockFormState} />)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('bg-zinc-900/50')
    })
  })

  describe('空狀態處理', () => {
    it('應該處理空標題', () => {
      const emptyTitle = { ...mockFormState, title: '' }
      render(<LessonPreview formState={emptyTitle} />)
      // 應該顯示預設提示
      expect(screen.getByText('（未設定標題）')).toBeInTheDocument()
    })

    it('應該處理空 WHAT', () => {
      const emptyWhat = { ...mockFormState, what: '' }
      render(<LessonPreview formState={emptyWhat} />)
      // 應該顯示預設提示
      expect(screen.getByText('（未填寫說明）')).toBeInTheDocument()
    })

    it('應該處理空步驟陣列', () => {
      const emptyHow = { ...mockFormState, how: [] }
      render(<LessonPreview formState={emptyHow} />)
      expect(screen.getByText('怎麼練')).toBeInTheDocument()
      // 應該顯示空狀態
      expect(screen.queryByText('步驟 1')).not.toBeInTheDocument()
    })
  })

  describe('響應式設計', () => {
    it('應該在大螢幕顯示完整佈局', () => {
      const { container } = render(<LessonPreview formState={mockFormState} />)
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('p-6')
    })
  })
})
