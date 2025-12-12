export class AffiliateError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AffiliateError'
  }
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof AffiliateError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '發生未知錯誤，請稍後再試'
}

export const showErrorAlert = (error: unknown) => {
  const message = handleApiError(error)
  alert(message)
}
