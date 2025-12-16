import { renderHook, act } from '@testing-library/react'
import { useErrorBoundary } from '@/hooks/common/useErrorBoundary'

describe('useErrorBoundary', () => {
  it('should capture and display errors', () => {
    const { result } = renderHook(() => useErrorBoundary())
    
    expect(result.current.error).toBe(null)
    expect(result.current.hasError).toBe(false)
    
    const testError = new Error('Test error')
    
    act(() => {
      result.current.captureError(testError)
    })
    
    expect(result.current.error).toBe(testError)
    expect(result.current.hasError).toBe(true)
  })

  it('should provide error recovery', () => {
    const { result } = renderHook(() => useErrorBoundary())
    
    const testError = new Error('Test error')
    
    act(() => {
      result.current.captureError(testError)
    })
    
    expect(result.current.hasError).toBe(true)
    
    act(() => {
      result.current.resetError()
    })
    
    expect(result.current.error).toBe(null)
    expect(result.current.hasError).toBe(false)
  })

  it('should handle string errors', () => {
    const { result } = renderHook(() => useErrorBoundary())
    
    act(() => {
      result.current.captureError('String error')
    })
    
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('String error')
  })

  it('should provide error throwing capability', () => {
    const { result } = renderHook(() => useErrorBoundary())
    
    const testError = new Error('Test error')
    
    expect(() => {
      result.current.throwError(testError)
    }).toThrow('Test error')
  })

  it('should handle async errors', async () => {
    const { result } = renderHook(() => useErrorBoundary())
    
    const asyncError = async () => {
      throw new Error('Async error')
    }
    
    await act(async () => {
      try {
        await asyncError()
      } catch (error) {
        result.current.captureError(error)
      }
    })
    
    expect(result.current.hasError).toBe(true)
    expect(result.current.error?.message).toBe('Async error')
  })
})
