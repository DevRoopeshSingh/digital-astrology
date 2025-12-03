import { vi } from 'vitest'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Mock Supabase User
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '+911234567890',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      name: 'Test User',
      ...overrides.user_metadata,
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Mock Supabase Session
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
  const user = createMockUser(overrides.user)

  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
    ...overrides,
  }
}

/**
 * Mock Supabase Auth Client
 */
export function createMockSupabaseAuth() {
  return {
    getSession: vi.fn().mockResolvedValue({
      data: { session: createMockSession() },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: {
        user: createMockUser(),
        session: createMockSession(),
      },
      error: null,
    }),
    signInWithOtp: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { url: 'https://oauth.example.com', provider: 'google' },
      error: null,
    }),
    verifyOtp: vi.fn().mockResolvedValue({
      data: {
        user: createMockUser(),
        session: createMockSession(),
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    updateUser: vi.fn().mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }),
  }
}

/**
 * Mock Supabase Client
 */
export function createMockSupabaseClient() {
  return {
    auth: createMockSupabaseAuth(),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({
        data: { path: 'test-path' },
        error: null,
      }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://storage.example.com/test' },
      }),
    },
  }
}

/**
 * Mock createClient from @/lib/supabase/client
 */
export function mockSupabaseClient() {
  const mockClient = createMockSupabaseClient()

  vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => mockClient),
  }))

  return mockClient
}

/**
 * Mock createClient from @/lib/supabase/server
 */
export function mockSupabaseServer() {
  const mockClient = createMockSupabaseClient()

  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => mockClient),
  }))

  return mockClient
}
