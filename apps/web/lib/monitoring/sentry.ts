/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as Sentry from '@sentry/nextjs'

/**
 * Initialize Sentry for error tracking
 * Only runs in production or when NEXT_PUBLIC_SENTRY_DSN is set
 */
export function initSentry() {
  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
  const ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV

  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, error tracking disabled')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,

    // Performance monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Error filtering
    beforeSend(event, hint) {
      const error = hint.originalException

      // Filter out expected errors
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message)

        // Ignore common browser errors
        if (message.includes('ResizeObserver loop limit exceeded')) {
          return null
        }

        // Ignore network errors (user probably lost connection)
        if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
          return null
        }

        // Ignore auth errors (these are expected)
        if (message.includes('Invalid or expired session')) {
          return null
        }
      }

      return event
    },

    // Ignore specific errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'cancelled', // User navigation
    ],
  })
}

/**
 * Capture an exception to Sentry
 */
export function captureException(error: Error | unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'test') return

  Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Capture a message to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (process.env.NODE_ENV === 'test') return

  Sentry.captureMessage(message, level)
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (process.env.NODE_ENV === 'test') return

  Sentry.setUser(user)
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string
  category?: string
  level?: Sentry.SeverityLevel
  data?: Record<string, unknown>
}) {
  if (process.env.NODE_ENV === 'test') return

  Sentry.addBreadcrumb(breadcrumb)
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => any>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args)

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureException(error, context)
          throw error
        })
      }

      return result
    } catch (error) {
      captureException(error, context)
      throw error
    }
  }) as T
}

/**
 * Create a performance transaction
 */
// Note: startTransaction is deprecated in Sentry v8+
// If you need transaction tracking, use Sentry.startSpan() instead
// export function startTransaction(name: string, op: string) {
//   if (process.env.NODE_ENV === 'test') {
//     return {
//       finish: () => {},
//       setStatus: () => {},
//       setData: () => {},
//     }
//   }
//
//   return Sentry.startSpan({ name, op }, () => {})
// }
