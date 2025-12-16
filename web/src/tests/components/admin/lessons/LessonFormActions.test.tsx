import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LessonFormActions } from '@/components/admin/lessons/LessonFormActions'

describe('LessonFormActions', () => {
  const mockSubmit = jest.fn()
  const mockReset = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    mockSubmit.mockClear()
    mockReset.mockClear()
    mockOnCancel.mockClear()
  })

  it('should render action buttons', () => {
    render(
      <LessonFormActions
        isSubmitting={false}
        onSubmit={mockSubmit}
        onReset={mockReset}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getByText('儲存')).toBeInTheDocument()
    expect(screen.getByText('重置')).toBeInTheDocument()
    expect(screen.getByText('取消')).toBeInTheDocument()
  })

  it('should handle submit correctly', async () => {
    mockSubmit.mockResolvedValue(undefined)
    
    render(
      <LessonFormActions
        isSubmitting={false}
        onSubmit={mockSubmit}
        onReset={mockReset}
        onCancel={mockOnCancel}
      />
    )
    
    const submitButton = screen.getByText('儲存')
    fireEvent.click(submitButton)
    
    expect(mockSubmit).toHaveBeenCalled()
  })

  it('should show loading states', () => {
    render(
      <LessonFormActions
        isSubmitting={true}
        onSubmit={mockSubmit}
        onReset={mockReset}
        onCancel={mockOnCancel}
      />
    )
    
    const submitButton = screen.getByText('儲存中...')
    expect(submitButton).toBeDisabled()
  })

  it('should handle reset correctly', () => {
    render(
      <LessonFormActions
        isSubmitting={false}
        onSubmit={mockSubmit}
        onReset={mockReset}
        onCancel={mockOnCancel}
      />
    )
    
    const resetButton = screen.getByText('重置')
    fireEvent.click(resetButton)
    
    expect(mockReset).toHaveBeenCalled()
  })

  it('should handle cancel correctly', () => {
    render(
      <LessonFormActions
        isSubmitting={false}
        onSubmit={mockSubmit}
        onReset={mockReset}
        onCancel={mockOnCancel}
      />
    )
    
    const cancelButton = screen.getByText('取消')
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should disable buttons when submitting', () => {
    render(
      <LessonFormActions
        isSubmitting={true}
        onSubmit={mockSubmit}
        onReset={mockReset}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getByText('儲存中...')).toBeDisabled()
    expect(screen.getByText('重置')).toBeDisabled()
    // Cancel should still be enabled
    expect(screen.getByText('取消')).not.toBeDisabled()
  })

  it('should show different text for edit mode', () => {
    render(
      <LessonFormActions
        isSubmitting={false}
        isEditMode={true}
        onSubmit={mockSubmit}
        onReset={mockReset}
        onCancel={mockOnCancel}
      />
    )
    
    expect(screen.getByText('更新')).toBeInTheDocument()
  })
})
