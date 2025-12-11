import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/monitoring/logger'
import { cachedAstrologyAPI, createAstrologyRequest } from '@/lib/astrology/cached-client'

/**
 * Helper: Compute astrological signs from birth chart data
 */
async function computeAstrologicalSigns(
  birthDate: Date,
  latitude: number,
  longitude: number,
  timezone: number
): Promise<{
  sunSign: string | null
  moonSign: string | null
  risingSign: string | null
  risingDegree: number | null
  birthDetailsJson: Record<string, unknown>
}> {
  try {
    // Create astrology request
    const astrologyRequest = createAstrologyRequest({
      dateTime: birthDate,
      latitude,
      longitude,
      timezone,
    })

    // Get birth chart from API
    const birthChartResponse = await cachedAstrologyAPI.getBirthChart(astrologyRequest)

    // Extract planet data from the nested response structure
    const chartData = birthChartResponse.data

    // The API returns data in output[1] for planets
    const planetsData = chartData.output?.[1]
    const ascendantData = chartData.output?.[0]?.['0']

    if (!planetsData) {
      logger.warn('No planet data in birth chart response', { chartData })
      return {
        sunSign: null,
        moonSign: null,
        risingSign: null,
        risingDegree: null,
        birthDetailsJson: chartData,
      }
    }

    // Helper to get sign name from sign number (1-12)
    const getSignName = (signNumber: number): string => {
      const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ]
      return signs[(signNumber - 1) % 12] || 'Unknown'
    }

    // Extract Sun sign (from Sun planet)
    const sunPlanet = planetsData['Sun']
    const sunSign = sunPlanet?.current_sign
      ? getSignName(sunPlanet.current_sign)
      : null

    // Extract Moon sign (from Moon planet)
    const moonPlanet = planetsData['Moon']
    const moonSign = moonPlanet?.current_sign
      ? getSignName(moonPlanet.current_sign)
      : null

    // Extract Rising sign (Ascendant/Lagna)
    const ascendantDegree = ascendantData?.ascendant || chartData.ascendant
    const risingSignNumber = ascendantData?.sign || (ascendantDegree ? Math.floor(ascendantDegree / 30) + 1 : null)
    const risingSign = risingSignNumber ? getSignName(risingSignNumber) : null

    logger.info('Computed astrological signs', {
      sunSign,
      moonSign,
      risingSign,
      risingDegree: ascendantDegree,
    })

    return {
      sunSign,
      moonSign,
      risingSign,
      risingDegree: ascendantDegree || null,
      birthDetailsJson: chartData,
    }
  } catch (error) {
    logger.error('Failed to compute astrological signs', error)
    // Return nulls but don't fail the onboarding
    return {
      sunSign: null,
      moonSign: null,
      risingSign: null,
      risingDegree: null,
      birthDetailsJson: null,
    }
  }
}

/**
 * POST /api/onboarding
 *
 * Save user onboarding data (birth details and preferences)
 * Computes and stores sun sign, moon sign, and rising sign
 *
 * Body:
 * {
 *   "name": "John Doe",
 *   "birthDate": "1990-01-15",
 *   "birthTime": "10:30",
 *   "birthPlace": "Delhi, India",
 *   "birthLatitude": 28.6139,
 *   "birthLongitude": 77.2090,
 *   "birthTimezone": 5.5,
 *   "preferredSystem": "VEDIC" | "WESTERN"
 * }
 */
export async function POST(request: Request) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.warn('Onboarding API: Unauthorized request', { authError })
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      birthDate,
      birthTime,
      birthPlace,
      birthLatitude,
      birthLongitude,
      birthTimezone,
      preferredSystem
    } = body

    // Validate required fields
    if (!name || !birthDate || !birthTime || !birthPlace ||
        birthLatitude === undefined || birthLongitude === undefined ||
        birthTimezone === undefined || !preferredSystem) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: [
            'name',
            'birthDate',
            'birthTime',
            'birthPlace',
            'birthLatitude',
            'birthLongitude',
            'birthTimezone',
            'preferredSystem'
          ],
        },
        { status: 400 }
      )
    }

    // Validate preferredSystem enum
    if (preferredSystem !== 'VEDIC' && preferredSystem !== 'WESTERN') {
      return NextResponse.json(
        { error: 'Invalid preferredSystem. Must be VEDIC or WESTERN' },
        { status: 400 }
      )
    }

    // Validate birth date format and ensure it's not in the future
    const birthDateTime = new Date(`${birthDate}T${birthTime}`)

    if (isNaN(birthDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birth date or time format' },
        { status: 400 }
      )
    }

    if (birthDateTime > new Date()) {
      return NextResponse.json(
        { error: 'Birth date cannot be in the future' },
        { status: 400 }
      )
    }

    // Compute astrological signs from birth chart
    logger.info('Computing astrological signs...', {
      birthDate: birthDateTime,
      latitude: birthLatitude,
      longitude: birthLongitude,
    })

    const { sunSign, moonSign, risingSign, risingDegree, birthDetailsJson } =
      await computeAstrologicalSigns(
        birthDateTime,
        birthLatitude,
        birthLongitude,
        birthTimezone
      )

    logger.info('Astrological signs computed', {
      sunSign,
      moonSign,
      risingSign,
    })

    // Look up user in our database (should exist from auth callback)
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email || undefined },
          { phone: user.phone || undefined },
        ]
      }
    })

    // If user doesn't exist (edge case), create them
    if (!dbUser) {
      logger.warn('User not found in database during onboarding, creating...', {
        email: user.email,
        phone: user.phone,
      })

      dbUser = await prisma.user.create({
        data: {
          email: user.email || null,
          phone: user.phone || null,
          image: user.user_metadata?.avatar_url || null,
          name,
          onboardingCompleted: false,
        },
      })
    }

    // Prepare onboarding data with computed signs
    const onboardingData = {
      name, // Update name in case they changed it
      birthDate: birthDateTime,
      birthTime,
      birthPlace,
      birthLatitude,
      birthLongitude,
      birthTimezone: birthTimezone.toString(),
      birthDetailsJson,
      sunSign,
      moonSign,
      risingSign,
      risingDegree,
      preferredSystem,
      onboardingCompleted: true,
      updatedAt: new Date(),
    }

    // Update user with onboarding data
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: onboardingData,
    })

    logger.info('User onboarding completed', {
      userId: dbUser.id,
      email: dbUser.email,
      sunSign,
      moonSign,
      risingSign,
      onboardingCompleted: true,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding completed successfully',
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          birthPlace: dbUser.birthPlace,
          preferredSystem: dbUser.preferredSystem,
          onboardingCompleted: dbUser.onboardingCompleted,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Onboarding API error', error)

    return NextResponse.json(
      {
        error: 'Failed to save onboarding data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/onboarding
 *
 * Check if current user has completed onboarding
 */
export async function GET() {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email || undefined },
          { phone: user.phone || undefined },
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        birthDate: true,
        birthPlace: true,
        preferredSystem: true,
        onboardingCompleted: true,
      }
    })

    if (!dbUser) {
      return NextResponse.json(
        {
          onboardingCompleted: false,
          message: 'User not found in database. Please complete onboarding.',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        onboardingCompleted: dbUser.onboardingCompleted,
        user: dbUser,
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Onboarding check API error', error)

    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    )
  }
}
