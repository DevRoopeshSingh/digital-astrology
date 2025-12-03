import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSupabaseAuth } from './use-supabase-auth'
import { createMockSupabaseClient, createMockSession } from '@test/mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useSupabaseAuth', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockClient = createMockSupabaseClient()
    const { createClient } = await import('@/lib/supabase/client')
    vi.mocked(createClient).mockReturnValue(mockClient as any)
  })

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useSupabaseAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
  })

  it('loads user session on mount', async () => {
    const mockSession = createMockSession()

    mockClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as any)

    const { result } = renderHook(() => useSupabaseAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeDefined()
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles no session on mount', async () => {
    mockClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as any)

    const { result } = renderHook(() => useSupabaseAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('subscribes to auth state changes', async () => {
    const mockSession = createMockSession()
    let authCallback: Function

    mockClient.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      } as any
    })

    const { result } = renderHook(() => useSupabaseAuth())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Simulate auth state change
    authCallback('SIGNED_IN', mockSession)

    await waitFor(() => {
      expect(result.current.user).toBeDefined()
      expect(result.current.session).toEqual(mockSession)
    })
  })

  it('unsubscribes on unmount', () => {
    const unsubscribe = vi.fn()

    mockClient.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe,
        },
      },
    } as any)

    const { unmount } = renderHook(() => useSupabaseAuth())

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })

  it('memoizes supabase client', () => {
    const { rerender } = renderHook(() => useSupabaseAuth())

    const { createClient } = require('@/lib/supabase/client')
    const initialCallCount = vi.mocked(createClient).mock.calls.length

    rerender()

    expect(vi.mocked(createClient).mock.calls.length).toBe(initialCallCount)
  })
})
