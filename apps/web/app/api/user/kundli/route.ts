import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@digital-astrology/schemas'
import { z } from 'zod'

/**
 * Save Kundli (Birth Chart) to User Account
 * POST /api/user/kundli
 */

const saveKundliSchema = z.object({
  name: z.string().min(1, 'Chart name is required').max(100),
  birthDate: z.string().datetime(),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  birthPlace: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  chartData: z.record(z.unknown()),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = saveKundliSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, birthDate, birthTime, birthPlace, latitude, longitude, timezone, chartData } = parsed.data

    // Save kundli to database
    const kundli = await prisma.kundli.create({
      data: {
        userId: user.id,
        name,
        birthDate: new Date(birthDate),
        birthTime,
        birthPlace,
        latitude,
        longitude,
        timezone,
        chartData,
        isPublic: false,
      },
    })

    console.log('[api/user/kundli] Chart saved successfully', {
      kundliId: kundli.id,
      userId: user.id,
      chartName: name,
    })

    return NextResponse.json({
      success: true,
      kundli: {
        id: kundli.id,
        name: kundli.name,
        createdAt: kundli.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[api/user/kundli] Error saving chart', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Failed to save chart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Get User's Saved Kundlis
 * GET /api/user/kundli
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all kundlis for user
    const kundlis = await prisma.kundli.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        latitude: true,
        longitude: true,
        timezone: true,
        chartData: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      kundlis,
    })
  } catch (error) {
    console.error('[api/user/kundli] Error fetching charts', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Failed to fetch charts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Delete User's Kundli
 * DELETE /api/user/kundli?id={kundliId}
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get kundli ID from query params
    const searchParams = request.nextUrl.searchParams
    const kundliId = searchParams.get('id')

    if (!kundliId) {
      return NextResponse.json(
        { error: 'Kundli ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership and delete
    const kundli = await prisma.kundli.findUnique({
      where: { id: kundliId },
      select: { userId: true },
    })

    if (!kundli) {
      return NextResponse.json(
        { error: 'Chart not found' },
        { status: 404 }
      )
    }

    if (kundli.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.kundli.delete({
      where: { id: kundliId },
    })

    console.log('[api/user/kundli] Chart deleted successfully', {
      kundliId,
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Chart deleted successfully',
    })
  } catch (error) {
    console.error('[api/user/kundli] Error deleting chart', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Failed to delete chart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
