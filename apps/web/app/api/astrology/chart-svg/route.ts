import { NextResponse } from 'next/server'
import { cachedAstrologyAPI, createAstrologyRequest } from '@/lib/astrology/cached-client'
import { logger } from '@/lib/monitoring/logger'

/**
 * POST /api/astrology/chart-svg
 *
 * Get birth chart as SVG code
 *
 * Body:
 * {
 *   "dateTime": "1990-01-15T10:30:00",
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timezone": 5.5,
 *   "chartType": "D1" // Optional: D1, D9, D10, etc. (default: D1)
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { dateTime, latitude, longitude, timezone, chartType = 'D1' } = body

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

    // Get SVG chart (will be cached for 24 hours)
    const result =
      chartType === 'D1'
        ? await cachedAstrologyAPI.getChartSVG(astrologyRequest)
        : await cachedAstrologyAPI.getDivisionalChartSVG(
            astrologyRequest,
            chartType
          )

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error('Chart SVG API error', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch chart SVG',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
