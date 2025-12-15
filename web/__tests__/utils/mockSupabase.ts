/**
 * Supabase Mock 工具
 * 用於測試需要 Supabase 的組件和 Hook
 */

export const mockSupabaseUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    role: 'admin'
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z'
}

export const mockSupabaseSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockSupabaseUser
}

export const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockSupabaseUser },
      error: null
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: mockSupabaseSession },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null })
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null })
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://mock-url.com/image.jpg' } })
    }))
  }
})

export const mockFetch = (data: any, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
    text: async () => JSON.stringify(data)
  })
}
