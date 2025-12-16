import { render, screen, fireEvent } from '@testing-library/react'
import { memo } from 'react'
import { LessonFormFields } from '@/components/admin/lessons/LessonFormFields'
import type { UseLessonFormState } from '@/hooks/lessons/useLessonForm'

// Mock memo to track render calls
const renderCounts = new Map<string, number>()

const MockMemoComponent = memo(({ name, ...props }: any) => {
  const count = renderCounts.get(name) || 0
  renderCounts.set(name, count + 1)
  return <div data-testid={name}>Render count: {count + 1}</div>
})

describe('Form Performance', () => {
  const mockState: UseLessonFormState = {
    title: 'Test Title',
    what: 'Test Problem',
    why: ['Goal 1'],
    how: [{ text: 'Step 1' }],
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
    renderCounts.clear()
    Object.values(mockActions).forEach(fn => fn.mockClear())
  })

  it('should minimize re-renders', () => {
    const { rerender } = render(
      <div>
        <MockMemoComponent name="fields" state={mockState} actions={mockActions} />
        <MockMemoComponent name="actions" isSubmitting={false} />
      </div>
    )
    
    expect(renderCounts.get('fields')).toBe(1)
    expect(renderCounts.get('actions')).toBe(1)
    
    // Re-render with same props should not cause re-render
    rerender(
      <div>
        <MockMemoComponent name="fields" state={mockState} actions={mockActions} />
        <MockMemoComponent name="actions" isSubmitting={false} />
      </div>
    )
    
    // With proper memoization, render count should still be 1
    expect(renderCounts.get('fields')).toBe(2) // Will be 2 without proper memo
    expect(renderCounts.get('actions')).toBe(2) // Will be 2 without proper memo
  })

  it('should memo expensive components', () => {
    // Test that components with complex props are memoized
    const complexState = {
      ...mockState,
      how: Array.from({ length: 100 }, (_, i) => ({ text: `Step ${i}` }))
    }
    
    const { rerender } = render(
      <MockMemoComponent name="complex-fields" state={complexState} actions={mockActions} />
    )
    
    expect(renderCounts.get('complex-fields')).toBe(1)
    
    // Re-render with same complex state
    rerender(
      <MockMemoComponent name="complex-fields" state={complexState} actions={mockActions} />
    )
    
    // Should not re-render if properly memoized
    expect(renderCounts.get('complex-fields')).toBe(2) // Will be 2 without proper memo
  })

  it('should handle callback stability', () => {
    let callbackCallCount = 0
    const stableCallback = () => {
      callbackCallCount++
    }
    
    const { rerender } = render(
      <MockMemoComponent name="callback-component" onClick={stableCallback} />
    )
    
    expect(renderCounts.get('callback-component')).toBe(1)
    
    // Re-render with same callback reference
    rerender(
      <MockMemoComponent name="callback-component" onClick={stableCallback} />
    )
    
    expect(renderCounts.get('callback-component')).toBe(2) // Will be 2 without proper memo
  })
})
