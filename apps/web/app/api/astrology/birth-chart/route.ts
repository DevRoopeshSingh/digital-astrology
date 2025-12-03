import { NextResponse } from 'next/server'
import { cachedAstrologyAPI, createAstrologyRequest } from '@/lib/astrology/cached-client'
import { logger } from '@/lib/monitoring/logger'

/**
 * POST /api/astrology/birth-chart
 *
 * Get birth chart (D1 Rasi chart) for a given birth time/location
 *
 * Body:
 * {
 *   "dateTime": "1990-01-15T10:30:00",
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timezone": 5.5
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { dateTime, latitude, longitude, timezone } = body

    if (!dateTime || !latitude || !longitude || timezone === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['dateTime', 'latitude', 'longitude', 'timezone'],
        },
        { status: 400 }
      )
    }

    // Create astrology request
    const astrologyRequest = createAstrologyRequest({
      dateTime: new Date(dateTime),
      latitude,
      longitude,
      timezone,
    })

    // Get birth chart (will be cached for 24 hours)
    const result = await cachedAstrologyAPI.getBirthChart(astrologyRequest)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error('Birth chart API error', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch birth chart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
