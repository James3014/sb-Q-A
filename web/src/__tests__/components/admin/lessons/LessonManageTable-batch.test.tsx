/**
 * LessonManageTable Batch Operations Tests
 *
 * 測試批次操作功能
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { LessonManageTable } from '@/components/admin/lessons/LessonManageTable'
import type { Lesson } from '@/types/lessons'

const mockLessons: Lesson[] = [
  {
    id: '1',
    title: '基礎落葉飄',
    what: '學習落葉飄',
    why: ['建立平衡'],
    how: [{ text: '選擇緩坡' }],
    signals: { correct: ['順暢'], wrong: ['後仰'] },
    level_tags: ['初學'],
    slope_tags: ['緩坡'],
    is_premium: false,
    is_published: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: '進階轉彎',
    what: '學習轉彎',
    why: ['控制方向'],
    how: [{ text: '壓邊刃' }],
    signals: { correct: ['流暢'], wrong: ['失速'] },
    level_tags: ['進階'],
    slope_tags: ['中坡'],
    is_premium: true,
    is_published: false,
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
]

describe('LessonManageTable - Batch Operations', () => {
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnBatchPublish = jest.fn()
  const mockOnBatchDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('多選功能', () => {
    it('應該顯示全選 checkbox', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThanOrEqual(1)
    })

    it('應該可以選擇單個課程', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      // 第一個是全選，第二個是第一個課程
      const firstLessonCheckbox = checkboxes[1]
      fireEvent.click(firstLessonCheckbox)
      expect(firstLessonCheckbox).toBeChecked()
    })

    it('應該可以取消選擇課程', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      const firstLessonCheckbox = checkboxes[1]

      fireEvent.click(firstLessonCheckbox)
      expect(firstLessonCheckbox).toBeChecked()

      fireEvent.click(firstLessonCheckbox)
      expect(firstLessonCheckbox).not.toBeChecked()
    })

    it('應該可以選擇多個課程', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      fireEvent.click(checkboxes[2])

      expect(checkboxes[1]).toBeChecked()
      expect(checkboxes[2]).toBeChecked()
    })
  })

  describe('全選功能', () => {
    it('應該可以全選所有課程', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      fireEvent.click(selectAllCheckbox)

      // 所有課程 checkbox 應該被選中
      checkboxes.slice(1).forEach(checkbox => {
        expect(checkbox).toBeChecked()
      })
    })

    it('應該可以取消全選', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      const selectAllCheckbox = checkboxes[0]

      fireEvent.click(selectAllCheckbox) // 全選
      fireEvent.click(selectAllCheckbox) // 取消全選

      checkboxes.slice(1).forEach(checkbox => {
        expect(checkbox).not.toBeChecked()
      })
    })
  })

  describe('批次工具列', () => {
    it('應該在選擇課程時顯示批次工具列', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])

      expect(screen.getByText(/已選擇 1 項/)).toBeInTheDocument()
    })

    it('應該顯示正確的選中數量', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      fireEvent.click(checkboxes[2])

      expect(screen.getByText(/已選擇 2 項/)).toBeInTheDocument()
    })

    it('應該顯示取消選擇按鈕', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])

      expect(screen.getByText('取消選擇')).toBeInTheDocument()
    })

    it('應該可以取消所有選擇', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      fireEvent.click(checkboxes[2])

      const cancelButton = screen.getByText('取消選擇')
      fireEvent.click(cancelButton)

      expect(screen.queryByText(/已選擇/)).not.toBeInTheDocument()
    })
  })

  describe('批次操作按鈕', () => {
    it('應該顯示批次發布按鈕', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])

      expect(screen.getByText('批次發布')).toBeInTheDocument()
    })

    it('應該顯示批次刪除按鈕', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])

      expect(screen.getByText('批次刪除')).toBeInTheDocument()
    })

    it('應該調用批次發布回調', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])

      const publishButton = screen.getByText('批次發布')
      fireEvent.click(publishButton)

      expect(mockOnBatchPublish).toHaveBeenCalledWith(['1'])
    })

    it('應該調用批次刪除回調', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      fireEvent.click(checkboxes[2])

      const deleteButton = screen.getByText('批次刪除')
      fireEvent.click(deleteButton)

      expect(mockOnBatchDelete).toHaveBeenCalledWith(['1', '2'])
    })
  })

  describe('批次操作後狀態', () => {
    it('應該在批次操作後清除選擇', () => {
      render(
        <LessonManageTable
          lessons={mockLessons}
          isLoading={false}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onBatchPublish={mockOnBatchPublish}
          onBatchDelete={mockOnBatchDelete}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])

      const publishButton = screen.getByText('批次發布')
      fireEvent.click(publishButton)

      // 批次操作後工具列應該消失（選擇已清除）
      expect(screen.queryByText(/已選擇/)).not.toBeInTheDocument()
    })
  })
})
