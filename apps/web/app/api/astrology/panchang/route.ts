import { NextResponse } from 'next/server'
import { cachedAstrologyAPI, createAstrologyRequest } from '@/lib/astrology/cached-client'
import { logger } from '@/lib/monitoring/logger'

/**
 * POST /api/astrology/panchang
 *
 * Get Panchang (Vedic calendar) for a date/location
 *
 * Body:
 * {
 *   "date": "2025-12-03", // Date in YYYY-MM-DD format
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timezone": 5.5
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { date, latitude, longitude, timezone } = body

    if (!date || !latitude || !longitude || timezone === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['date', 'latitude', 'longitude', 'timezone'],
        },
        { status: 400 }
      )
    }

    // Parse date and set time to sunrise (6:00 AM) for panchang calculation
    const dateTime = new Date(date)
    dateTime.setHours(6, 0, 0, 0)

    // Create astrology request
    const astrologyRequest = createAstrologyRequest({
      dateTime,
      latitude,
      longitude,
      timezone,
    })

    // Get panchang (will be cached for 6 hours)
    const result = await cachedAstrologyAPI.getPanchang(astrologyRequest)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error('Panchang API error', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch panchang',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
