import { cached } from '@/lib/api/cache'
import { logger } from '@/lib/monitoring/logger'
import {
  astrologyAPI,
  createAstrologyRequest,
  type AstrologyAPIClient,
} from './client'
import type {
  AstrologyRequest,
  BirthChartResponse,
  SVGChartResponse,
  PanchangResponse,
  CompatibilityResponse,
  DasaResponse,
  PlanetaryStrengthResponse,
  WesternNatalResponse,
  DivisionalChartType,
  CachedResponse,
} from './types'

/**
 * Cached Astrology API Client
 *
 * Wraps all API calls with aggressive 24-hour caching to respect
 * the 50 requests/day limit.
 *
 * Cache Strategy:
 * - Birth charts: 24 hours (birth data doesn't change)
 * - Panchang: 6 hours (daily data, but changes slowly)
 * - Compatibility: 24 hours (static calculation)
 * - SVG charts: 24 hours (visual representation doesn't change)
 *
 * Cache keys are based on:
 * - Birth date/time
 * - Location (lat/long)
 * - Timezone
 * - Chart configuration (ayanamsha, observation point)
 */

// 24 hours in milliseconds
const CACHE_24H = 24 * 60 * 60 * 1000

// 6 hours in milliseconds
const CACHE_6H = 6 * 60 * 60 * 1000

/**
 * Generate cache key for birth-based data
 */
function generateCacheKey(request: AstrologyRequest, suffix: string): string {
  const {
    year,
    month,
    date,
    hours,
    minutes,
    seconds,
    latitude,
    longitude,
    timezone,
    observation_point,
    ayanamsha,
  } = request

  // Round coordinates to 4 decimal places (~11 meters precision)
  const lat = latitude.toFixed(4)
  const lon = longitude.toFixed(4)

  return `astro:${suffix}:${year}-${month}-${date}T${hours}:${minutes}:${seconds}:${lat}:${lon}:${timezone}:${observation_point}:${ayanamsha}`
}

/**
 * Generate cache key for compatibility (two people)
 */
function generateCompatibilityKey(
  person1: AstrologyRequest,
  person2: AstrologyRequest
): string {
  // Sort to ensure same result regardless of order
  const key1 = generateCacheKey(person1, 'p1')
  const key2 = generateCacheKey(person2, 'p2')

  return `astro:compatibility:${key1}:${key2}`
}

/**
 * Wrap response with cache metadata
 */
function wrapCachedResponse<T>(data: T, ttl: number): CachedResponse<T> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttl)

  return {
    data,
    cached_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    from_cache: false, // Will be true if served from cache
  }
}

/**
 * Cached API methods
 */

const getBirthChartCached = cached(
  async (request: AstrologyRequest) => {
    logger.info('Fetching birth chart from API', { request })
    const data = await astrologyAPI.getBirthChart(request)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (request: AstrologyRequest) => generateCacheKey(request, 'birth-chart'),
    staleWhileRevalidate: true,
  }
)

const getDivisionalChartCached = cached(
  async (request: AstrologyRequest, chartType: DivisionalChartType) => {
    logger.info('Fetching divisional chart from API', { request, chartType })
    const data = await astrologyAPI.getDivisionalChart(request, chartType)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (request: AstrologyRequest, chartType: DivisionalChartType) =>
      generateCacheKey(request, `div-chart-${chartType}`),
    staleWhileRevalidate: true,
  }
)

const getChartSVGCached = cached(
  async (request: AstrologyRequest) => {
    logger.info('Fetching chart SVG from API', { request })
    const data = await astrologyAPI.getChartSVG(request)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (request: AstrologyRequest) => generateCacheKey(request, 'chart-svg'),
    staleWhileRevalidate: true,
  }
)

const getDivisionalChartSVGCached = cached(
  async (request: AstrologyRequest, chartType: DivisionalChartType) => {
    logger.info('Fetching divisional chart SVG from API', {
      request,
      chartType,
    })
    const data = await astrologyAPI.getDivisionalChartSVG(request, chartType)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (request: AstrologyRequest, chartType: DivisionalChartType) =>
      generateCacheKey(request, `chart-svg-${chartType}`),
    staleWhileRevalidate: true,
  }
)

const getPanchangCached = cached(
  async (request: AstrologyRequest) => {
    logger.info('Fetching panchang from API', { request })
    const data = await astrologyAPI.getPanchang(request)
    return wrapCachedResponse(data, CACHE_6H)
  },
  {
    ttl: CACHE_6H, // Shorter TTL for daily changing data
    key: (request: AstrologyRequest) => generateCacheKey(request, 'panchang'),
    staleWhileRevalidate: true,
  }
)

const getCompatibilityCached = cached(
  async (person1: AstrologyRequest, person2: AstrologyRequest) => {
    logger.info('Fetching compatibility from API', { person1, person2 })
    const data = await astrologyAPI.getCompatibility(person1, person2)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (person1: AstrologyRequest, person2: AstrologyRequest) =>
      generateCompatibilityKey(person1, person2),
    staleWhileRevalidate: true,
  }
)

const getDasaCached = cached(
  async (request: AstrologyRequest) => {
    logger.info('Fetching dasa from API', { request })
    const data = await astrologyAPI.getDasa(request)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (request: AstrologyRequest) => generateCacheKey(request, 'dasa'),
    staleWhileRevalidate: true,
  }
)

const getPlanetaryStrengthCached = cached(
  async (request: AstrologyRequest) => {
    logger.info('Fetching planetary strength from API', { request })
    const data = await astrologyAPI.getPlanetaryStrength(request)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (request: AstrologyRequest) =>
      generateCacheKey(request, 'planetary-strength'),
    staleWhileRevalidate: true,
  }
)

const getWesternNatalCached = cached(
  async (request: AstrologyRequest) => {
    logger.info('Fetching western natal from API', { request })
    const data = await astrologyAPI.getWesternNatal(request)
    return wrapCachedResponse(data, CACHE_24H)
  },
  {
    ttl: CACHE_24H,
    key: (request: AstrologyRequest) =>
      generateCacheKey(request, 'western-natal'),
    staleWhileRevalidate: true,
  }
)

/**
 * Cached Astrology API Client
 * Use this instead of direct astrologyAPI to benefit from caching
 */
export class CachedAstrologyAPIClient {
  async getBirthChart(
    request: AstrologyRequest
  ): Promise<CachedResponse<BirthChartResponse>> {
    const result = await getBirthChartCached(request)
    result.from_cache = true
    return result
  }

  async getDivisionalChart(
    request: AstrologyRequest,
    chartType: DivisionalChartType
  ): Promise<CachedResponse<BirthChartResponse>> {
    const result = await getDivisionalChartCached(request, chartType)
    result.from_cache = true
    return result
  }

  async getChartSVG(
    request: AstrologyRequest
  ): Promise<CachedResponse<SVGChartResponse>> {
    const result = await getChartSVGCached(request)
    result.from_cache = true
    return result
  }

  async getDivisionalChartSVG(
    request: AstrologyRequest,
    chartType: DivisionalChartType
  ): Promise<CachedResponse<SVGChartResponse>> {
    const result = await getDivisionalChartSVGCached(request, chartType)
    result.from_cache = true
    return result
  }

  async getPanchang(
    request: AstrologyRequest
  ): Promise<CachedResponse<PanchangResponse>> {
    const result = await getPanchangCached(request)
    result.from_cache = true
    return result
  }

  async getCompatibility(
    person1: AstrologyRequest,
    person2: AstrologyRequest
  ): Promise<CachedResponse<CompatibilityResponse>> {
    const result = await getCompatibilityCached(person1, person2)
    result.from_cache = true
    return result
  }

  async getDasa(
    request: AstrologyRequest
  ): Promise<CachedResponse<DasaResponse>> {
    const result = await getDasaCached(request)
    result.from_cache = true
    return result
  }

  async getPlanetaryStrength(
    request: AstrologyRequest
  ): Promise<CachedResponse<PlanetaryStrengthResponse>> {
    const result = await getPlanetaryStrengthCached(request)
    result.from_cache = true
    return result
  }

  async getWesternNatal(
    request: AstrologyRequest
  ): Promise<CachedResponse<WesternNatalResponse>> {
    const result = await getWesternNatalCached(request)
    result.from_cache = true
    return result
  }

  /**
   * Get rate limit info from underlying client
   */
  getRateLimitInfo() {
    return astrologyAPI.getRateLimitInfo()
  }
}

/**
 * Export singleton instance
 * USE THIS for all astrology API calls to benefit from caching
 */
export const cachedAstrologyAPI = new CachedAstrologyAPIClient()

/**
 * Re-export helper
 */
export { createAstrologyRequest }
