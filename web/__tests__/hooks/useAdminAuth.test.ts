import { renderHook, waitFor } from '@testing-library/react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import { getSupabase } from '@/lib/supabase'
import { isAdminUser } from '@/lib/adminAuth'

// Mock dependencies
jest.mock('@/lib/supabase')
jest.mock('@/lib/adminAuth')

const mockGetSupabase = getSupabase as jest.MockedFunction<typeof getSupabase>
const mockIsAdminUser = isAdminUser as jest.MockedFunction<typeof isAdminUser>

describe('useAdminAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return loading=false after initialization when no supabase', async () => {
    mockGetSupabase.mockReturnValue(null)

    const { result } = renderHook(() => useAdminAuth())

    // Initially loading may or may not be true (race condition)
    // But it should eventually be false
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthorized).toBe(false)
    expect(result.current.isReady).toBe(false)
  })

  it('should return isAuthorized=false when no supabase client', async () => {
    mockGetSupabase.mockReturnValue(null)

    const { result } = renderHook(() => useAdminAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthorized).toBe(false)
    expect(result.current.isReady).toBe(false)
  })

  it('should return isAuthorized=false when no user', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: null
        })
      }
    }
    mockGetSupabase.mockReturnValue(mockSupabase as any)

    const { result } = renderHook(() => useAdminAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthorized).toBe(false)
    expect(result.current.isReady).toBe(false)
  })

  it('should return isAuthorized=true when user is admin', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'admin@test.com',
      user_metadata: { role: 'admin' }
    }

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null
        })
      }
    }
    mockGetSupabase.mockReturnValue(mockSupabase as any)
    mockIsAdminUser.mockReturnValue(true)

    const { result } = renderHook(() => useAdminAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthorized).toBe(true)
    expect(result.current.isReady).toBe(true)
    expect(mockIsAdminUser).toHaveBeenCalledWith(mockUser)
  })

  it('should return isAuthorized=false when user is not admin', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'user@test.com',
      user_metadata: { role: 'user' }
    }

    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null
        })
      }
    }
    mockGetSupabase.mockReturnValue(mockSupabase as any)
    mockIsAdminUser.mockReturnValue(false)

    const { result } = renderHook(() => useAdminAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthorized).toBe(false)
    expect(result.current.isReady).toBe(false)
  })
})
