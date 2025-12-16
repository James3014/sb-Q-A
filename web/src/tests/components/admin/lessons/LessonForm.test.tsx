import { render, screen, waitFor } from '@testing-library/react'
import { LessonForm } from '@/components/admin/lessons/LessonForm'
import { useLessonEditor } from '@/hooks/lessons/useLessonEditor'

jest.mock('@/hooks/lessons/useLessonEditor')
jest.mock('@/components/admin/lessons/LessonFormFields', () => ({
  LessonFormFields: ({ state }: any) => <div data-testid="form-fields">Fields: {state.title}</div>
}))
jest.mock('@/components/admin/lessons/LessonFormActions', () => ({
  LessonFormActions: ({ isSubmitting }: any) => (
    <div data-testid="form-actions">Actions: {isSubmitting ? 'loading' : 'ready'}</div>
  )
}))

const mockUseLessonEditor = useLessonEditor as jest.MockedFunction<typeof useLessonEditor>

describe('LessonForm', () => {
  const mockEditor = {
    state: {
      title: 'Test Title',
      what: 'Test Problem',
      why: [],
      how: [{ text: '' }],
      signals: { correct: [], wrong: [] },
      level_tags: [],
      slope_tags: [],
      is_premium: false,
    },
    isSubmitting: false,
    setTitle: jest.fn(),
    setWhat: jest.fn(),
    setWhy: jest.fn(),
    setHow: jest.fn(),
    setSignals: jest.fn(),
    setLevelTags: jest.fn(),
    setSlopeTags: jest.fn(),
    setIsPremium: jest.fn(),
    updateStep: jest.fn(),
    addStep: jest.fn(),
    removeStep: jest.fn(),
    reset: jest.fn(),
    submit: jest.fn(),
  }

  beforeEach(() => {
    mockUseLessonEditor.mockReturnValue(mockEditor)
  })

  it('should orchestrate form components', () => {
    render(<LessonForm />)
    
    expect(screen.getByTestId('form-fields')).toBeInTheDocument()
    expect(screen.getByTestId('form-actions')).toBeInTheDocument()
    expect(screen.getByText('Fields: Test Title')).toBeInTheDocument()
    expect(screen.getByText('Actions: ready')).toBeInTheDocument()
  })

  it('should handle data flow correctly', () => {
    render(<LessonForm lessonId="01" />)
    
    expect(mockUseLessonEditor).toHaveBeenCalledWith({
      lessonId: '01',
      onSuccess: expect.any(Function)
    })
  })

  it('should show loading state', () => {
    mockUseLessonEditor.mockReturnValue({
      ...mockEditor,
      isSubmitting: true
    })
    
    render(<LessonForm />)
    
    expect(screen.getByText('Actions: loading')).toBeInTheDocument()
  })

  it('should handle success callback', () => {
    const mockOnSuccess = jest.fn()
    render(<LessonForm onSuccess={mockOnSuccess} />)
    
    expect(mockUseLessonEditor).toHaveBeenCalledWith({
      onSuccess: mockOnSuccess
    })
  })

  it('should pass correct props to child components', () => {
    render(<LessonForm lessonId="01" />)
    
    // Verify that the hook is called with correct parameters
    expect(mockUseLessonEditor).toHaveBeenCalledWith({
      lessonId: '01',
      onSuccess: expect.any(Function)
    })
  })
})
