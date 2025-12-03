import { vi } from 'vitest'

/**
 * Wait for all pending promises to resolve
 */
export async function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now()

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`)
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

/**
 * Create a mock fetch response
 */
export function createMockResponse<T>(
  data: T,
  options: Partial<Response> = {}
): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data),
    ...options,
  } as Response
}

/**
 * Create a mock fetch error response
 */
export function createMockErrorResponse(
  message: string,
  status = 500
): Response {
  return {
    ok: false,
    status,
    statusText: message,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
  } as Response
}

/**
 * Mock localStorage for tests
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
  }
}

/**
 * Mock window.location
 */
export function mockLocation(href = 'http://localhost:3000/') {
  delete (window as any).location
  window.location = {
    href,
    origin: new URL(href).origin,
    protocol: new URL(href).protocol,
    host: new URL(href).host,
    hostname: new URL(href).hostname,
    port: new URL(href).port,
    pathname: new URL(href).pathname,
    search: new URL(href).search,
    hash: new URL(href).hash,
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    toString: () => href,
  } as any
}

/**
 * Create a delayed promise for testing loading states
 */
export function delayedPromise<T>(
  value: T,
  delayMs = 100
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delayMs)
  })
}

/**
 * Create a rejected promise for testing error states
 */
export function rejectedPromise(
  error: Error | string,
  delayMs = 0
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(typeof error === 'string' ? new Error(error) : error),
      delayMs
    )
  })
}
