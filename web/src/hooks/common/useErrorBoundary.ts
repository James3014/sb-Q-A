import { useCallback, useState } from 'react'

export interface UseErrorBoundaryReturn {
  error: Error | null
  hasError: boolean
  captureError: (error: unknown) => void
  resetError: () => void
  throwError: (error: unknown) => never
}

export function useErrorBoundary(): UseErrorBoundaryReturn {
  const [error, setError] = useState<Error | null>(null)

  const captureError = useCallback((error: unknown) => {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    setError(errorObj)
  }, [])

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const throwError = useCallback((error: unknown): never => {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    throw errorObj
  }, [])

  return {
    error,
    hasError: error !== null,
    captureError,
    resetError,
    throwError,
  }
}
