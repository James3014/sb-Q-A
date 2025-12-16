import { render, screen, fireEvent } from '@testing-library/react'
import { LessonFormFields } from '@/components/admin/lessons/LessonFormFields'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

describe('LessonFormFields', () => {
  const mockState: UseLessonFormState = {
    title: 'Test Title',
    what: 'Test Problem',
    why: ['Goal 1', 'Goal 2'],
    how: [{ text: 'Step 1' }, { text: 'Step 2' }],
    signals: { correct: ['Signal 1'], wrong: ['Signal 2'] },
    level_tags: ['intermediate'],
    slope_tags: ['blue'],
    is_premium: false,
  }

  const mockActions = {
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
  }

  beforeEach(() => {
    Object.values(mockActions).forEach(fn => fn.mockClear())
  })

  it('should render all form fields', () => {
    render(<LessonFormFields state={mockState} actions={mockActions} />)
    
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Problem')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Goal 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Step 1')).toBeInTheDocument()
  })

  it('should handle field updates', () => {
    render(<LessonFormFields state={mockState} actions={mockActions} />)
    
    const titleInput = screen.getByDisplayValue('Test Title')
    fireEvent.change(titleInput, { target: { value: 'New Title' } })
    
    expect(mockActions.setTitle).toHaveBeenCalledWith('New Title')
  })

  it('should display validation errors', () => {
    const errors = { title: 'Title is required' }
    render(<LessonFormFields state={mockState} actions={mockActions} errors={errors} />)
    
    expect(screen.getByText('Title is required')).toBeInTheDocument()
  })

  it('should handle step operations', () => {
    render(<LessonFormFields state={mockState} actions={mockActions} />)
    
    // Test add step
    const addButton = screen.getByText('新增步驟')
    fireEvent.click(addButton)
    
    expect(mockActions.addStep).toHaveBeenCalled()
  })

  it('should handle tag selection', () => {
    render(<LessonFormFields state={mockState} actions={mockActions} />)
    
    // Test level tag selection
    const beginnerTag = screen.getByText('初級')
    fireEvent.click(beginnerTag)
    
    expect(mockActions.setLevelTags).toHaveBeenCalledWith(['beginner'])
  })

  it('should handle premium toggle', () => {
    render(<LessonFormFields state={mockState} actions={mockActions} />)
    
    const premiumCheckbox = screen.getByRole('checkbox')
    fireEvent.click(premiumCheckbox)
    
    expect(mockActions.setIsPremium).toHaveBeenCalledWith(true)
  })
})
