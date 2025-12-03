import { NextResponse } from 'next/server'
import { cachedAstrologyAPI, createAstrologyRequest } from '@/lib/astrology/cached-client'
import { logger } from '@/lib/monitoring/logger'

/**
 * POST /api/astrology/compatibility
 *
 * Get compatibility score between two people (Ashtakoot matching)
 *
 * Body:
 * {
 *   "person1": {
 *     "dateTime": "1990-01-15T10:30:00",
 *     "latitude": 28.6139,
 *     "longitude": 77.2090,
 *     "timezone": 5.5
 *   },
 *   "person2": {
 *     "dateTime": "1992-03-20T14:15:00",
 *     "latitude": 19.0760,
 *     "longitude": 72.8777,
 *     "timezone": 5.5
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { person1, person2 } = body

    if (!person1 || !person2) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['person1', 'person2'],
          details:
            'Each person object must have: dateTime, latitude, longitude, timezone',
        },
        { status: 400 }
      )
    }

    // Validate person1
    if (
      !person1.dateTime ||
      !person1.latitude ||
      !person1.longitude ||
      person1.timezone === undefined
    ) {
      return NextResponse.json(
        {
          error: 'Invalid person1 data',
          required: ['dateTime', 'latitude', 'longitude', 'timezone'],
        },
        { status: 400 }
      )
    }

    // Validate person2
    if (
      !person2.dateTime ||
      !person2.latitude ||
      !person2.longitude ||
      person2.timezone === undefined
    ) {
      return NextResponse.json(
        {
          error: 'Invalid person2 data',
          required: ['dateTime', 'latitude', 'longitude', 'timezone'],
        },
        { status: 400 }
      )
    }

    // Create astrology requests
    const request1 = createAstrologyRequest({
      dateTime: new Date(person1.dateTime),
      latitude: person1.latitude,
      longitude: person1.longitude,
      timezone: person1.timezone,
    })

    const request2 = createAstrologyRequest({
      dateTime: new Date(person2.dateTime),
      latitude: person2.latitude,
      longitude: person2.longitude,
      timezone: person2.timezone,
    })

    // Get compatibility (will be cached for 24 hours)
    const result = await cachedAstrologyAPI.getCompatibility(request1, request2)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error('Compatibility API error', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch compatibility',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
