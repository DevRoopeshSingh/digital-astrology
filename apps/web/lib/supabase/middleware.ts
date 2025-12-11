/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Don't just check if user exists to refresh the session
  // This will cause issues with server-side rendering
  // Instead, let the session refresh happen naturally
  await supabase.auth.getUser()

  return supabaseResponse
}

/**
 * Authentication error response
 */
function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    { error: 'unauthorized', message },
    { status: 401 }
  )
}

/**
 * Server error response
 */
function serverErrorResponse(message = 'Authentication failed') {
  return NextResponse.json(
    { error: 'server_error', message },
    { status: 500 }
  )
}

/**
 * Require authentication for API routes
 * Returns user data if authenticated, or error response if not
 *
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await requireAuth(request)
 *   if (user instanceof NextResponse) return user // Auth failed, return error
 *
 *   // User is authenticated, proceed with request
 *   // Access user.id, user.email, etc.
 * }
 * ```
 */
export async function requireAuth(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('[requireAuth] Supabase auth error:', error.message)
      return unauthorizedResponse('Invalid or expired session')
    }

    if (!user) {
      return unauthorizedResponse('No active session')
    }

    return user
  } catch (error) {
    console.error('[requireAuth] Unexpected error:', error)
    return serverErrorResponse()
  }
}

/**
 * Optional authentication for API routes
 * Returns user data if authenticated, or null if not (without error response)
 *
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await optionalAuth(request)
 *
 *   if (user) {
 *     // User is authenticated, show personalized content
 *   } else {
 *     // User is not authenticated, show public content
 *   }
 * }
 * ```
 */
export async function optionalAuth(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return user
  } catch (error) {
    console.error('[optionalAuth] Error:', error)
    return null
  }
}
