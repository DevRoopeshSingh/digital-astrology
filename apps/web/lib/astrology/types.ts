/**
 * TypeScript Types for FreeAstrologyAPI.com
 *
 * API Documentation: https://freeastrologyapi.com/api-reference
 * Base URL: https://json.freeastrologyapi.com/
 */

/**
 * Birth details required for most API requests
 */
export interface BirthDetails {
  year: number          // Birth year (e.g., 2022)
  month: number         // Month without leading zero (1-12)
  date: number          // Day without leading zero (1-31)
  hours: number         // Hour without leading zero (0-23)
  minutes: number       // Minutes without leading zero (0-59)
  seconds: number       // Seconds without leading zero (0-59)
  latitude: number      // Range: -90 to 90
  longitude: number     // Range: -180 to 180
  timezone: number      // Timezone offset (e.g., 5.5 for IST)
}

/**
 * Chart configuration options
 */
export interface ChartConfig {
  observation_point: 'topocentric' | 'geocentric'
  ayanamsha: 'lahiri' | 'raman' | 'krishnamurti' | 'thirukanitham'
}

/**
 * Complete request payload
 */
export interface AstrologyRequest extends BirthDetails, ChartConfig {}

/**
 * Planetary position data
 */
export interface Planet {
  name: string
  fullDegree: number
  normDegree: number
  speed: number
  isRetro: string | boolean
  sign: string
  signLord: string
  nakshatra: string
  nakshatraLord: string
  house: number
}

/**
 * Birth chart response
 */
export interface BirthChartResponse {
  input: AstrologyRequest
  ascendant: number
  planets: Planet[]
  houses: {
    house: number
    sign: string
    degree: number
  }[]
}

/**
 * SVG Chart response
 */
export interface SVGChartResponse {
  svg_code: string
  chart_name: string
}

/**
 * Panchang (Vedic calendar) data
 */
export interface PanchangResponse {
  day: string
  sunrise: string
  sunset: string
  moonrise: string
  moonset: string
  tithi: {
    name: string
    start: string
    end: string
  }
  nakshatra: {
    name: string
    lord: string
    start: string
    end: string
  }
  yoga: {
    name: string
    start: string
    end: string
  }
  karana: {
    name: string
    start: string
    end: string
  }
  vedic_sunrise: string
  vedic_sunset: string
  paksha: string
  ritu: string
  month_amanta: string
  month_purnimanta: string
  sun_sign: string
  moon_sign: string
  ayana: string
  rahu_kalam: {
    start: string
    end: string
  }
  yamakanta_kalam: {
    start: string
    end: string
  }
  gulika_kalam: {
    start: string
    end: string
  }
  abhijit_muhurta: {
    start: string
    end: string
  }
  brahma_muhurta: {
    start: string
    end: string
  }
}

/**
 * Compatibility match response (Ashtakoot)
 */
export interface CompatibilityResponse {
  total_points: number
  maximum_points: number
  match_percentage: number
  attributes: {
    varna: { points: number; max_points: number; description: string }
    vashya: { points: number; max_points: number; description: string }
    tara: { points: number; max_points: number; description: string }
    yoni: { points: number; max_points: number; description: string }
    graha_maitri: { points: number; max_points: number; description: string }
    gana: { points: number; max_points: number; description: string }
    bhakoot: { points: number; max_points: number; description: string }
    nadi: { points: number; max_points: number; description: string }
  }
  conclusion: {
    report: string
    compatibility_level: 'Excellent' | 'Good' | 'Average' | 'Poor'
  }
}

/**
 * Dasa (planetary period) data
 */
export interface DasaResponse {
  maha_dasa: {
    planet: string
    start_date: string
    end_date: string
    antar_dasa: {
      planet: string
      start_date: string
      end_date: string
    }[]
  }[]
}

/**
 * Planetary strength (Shad Bala)
 */
export interface PlanetaryStrengthResponse {
  planets: {
    name: string
    total_strength: number
    sthana_bala: number
    dig_bala: number
    kaala_bala: number
    cheshta_bala: number
    naisargika_bala: number
    drig_bala: number
  }[]
}

/**
 * Western astrology natal data
 */
export interface WesternNatalResponse {
  planets: {
    name: string
    sign: string
    degree: number
    house: number
    retrograde: boolean
  }[]
  houses: {
    number: number
    sign: string
    degree: number
  }[]
  aspects: {
    planet1: string
    planet2: string
    aspect: string
    angle: number
  }[]
}

/**
 * Divisional chart types (D1-D60)
 */
export type DivisionalChartType =
  | 'D1'  // Rasi (Birth chart)
  | 'D2'  // Hora (Wealth)
  | 'D3'  // Drekkana (Siblings)
  | 'D4'  // Chaturthamsa (Property)
  | 'D7'  // Saptamsa (Children)
  | 'D9'  // Navamsa (Marriage)
  | 'D10' // Dasamsa (Career)
  | 'D12' // Dwadasamsa (Parents)
  | 'D16' // Shodasamsa (Vehicles)
  | 'D20' // Vimsamsa (Spiritual)
  | 'D24' // Chaturvimsamsa (Education)
  | 'D27' // Bhamsa (Strength)
  | 'D30' // Trimsamsa (Evils)
  | 'D40' // Khavedamsa (Auspicious)
  | 'D45' // Akshavedamsa (General)
  | 'D60' // Shashtiamsa (Past karma)

/**
 * API Error response
 */
export interface APIErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

/**
 * API Success wrapper
 */
export interface APISuccessResponse<T> {
  success: true
  data: T
}

/**
 * Rate limit tracking
 */
export interface RateLimitInfo {
  daily_limit: number
  used_today: number
  remaining_today: number
  reset_at: string
  last_request_at: string
}

/**
 * Cached response metadata
 */
export interface CachedResponse<T> {
  data: T
  cached_at: string
  expires_at: string
  from_cache: boolean
}
