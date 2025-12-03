# FreeAstrologyAPI.com Integration

## Overview

Complete integration with [FreeAstrologyAPI.com](https://freeastrologyapi.com) providing Indian Vedic astrology calculations including birth charts, divisional charts, Panchang, compatibility matching, and SVG visualizations.

**API Key**: Configured in `.env.local`
**Free Tier Limit**: 50 requests per day
**Cache Strategy**: Aggressive 24-hour caching to minimize API usage

## Features Integrated

### ✅ Birth Charts
- D1 Rasi (Main birth chart)
- 19 Divisional charts (D2-D60)
- Planetary positions
- House placements
- Nakshatra information

### ✅ Chart Visualizations
- SVG code generation
- South Indian & North Indian styles
- All divisional charts (D2-D60)
- Customizable Ayanamsha

### ✅ Panchang (Vedic Calendar)
- Sunrise/Sunset timings
- Tithi, Nakshatra, Yoga, Karana
- Rahu Kalam, Yamakanta, Gulika
- Abhijit & Brahma Muhurta
- Lunar month data

### ✅ Compatibility
- Ashtakoot matching
- 8-point compatibility analysis
- Match percentage
- Detailed attribute scores

### ⏳ Coming Soon
- Dasa periods (Vimsottari)
- Planetary strength (Shad Bala)
- Western astrology natal charts

---

## API Endpoints

### 1. Birth Chart

**POST** `/api/astrology/birth-chart`

Get complete birth chart with planetary positions.

**Request**:
```json
{
  "dateTime": "1990-01-15T10:30:00",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timezone": 5.5
}
```

**Response**:
```json
{
  "data": {
    "ascendant": 285.4,
    "planets": [
      {
        "name": "Sun",
        "fullDegree": 301.2,
        "normDegree": 1.2,
        "sign": "Capricorn",
        "house": 2,
        "nakshatra": "Uttara Ashadha",
        "isRetro": false
      }
      // ... more planets
    ],
    "houses": [ /* house data */ ]
  },
  "cached_at": "2025-12-03T15:00:00.000Z",
  "expires_at": "2025-12-04T15:00:00.000Z",
  "from_cache": false
}
```

**Cache**: 24 hours

---

### 2. Chart SVG

**POST** `/api/astrology/chart-svg`

Get birth chart as SVG code for visualization.

**Request**:
```json
{
  "dateTime": "1990-01-15T10:30:00",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timezone": 5.5,
  "chartType": "D1"  // Optional: D1, D9, D10, etc.
}
```

**Response**:
```json
{
  "data": {
    "svg_code": "<svg width='400' height='400'>...</svg>",
    "chart_name": "Birth Chart (D1)"
  },
  "cached_at": "2025-12-03T15:00:00.000Z",
  "expires_at": "2025-12-04T15:00:00.000Z",
  "from_cache": false
}
```

**Cache**: 24 hours

**Supported Chart Types**:
- `D1` - Rasi (Birth chart)
- `D9` - Navamsa (Marriage/Dharma)
- `D10` - Dasamsa (Career)
- `D2`, `D3`, `D4`, `D7`, `D12`, `D16`, `D20`, `D24`, `D27`, `D30`, `D40`, `D45`, `D60`

---

### 3. Panchang

**POST** `/api/astrology/panchang`

Get Vedic calendar information for a specific date and location.

**Request**:
```json
{
  "date": "2025-12-03",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timezone": 5.5
}
```

**Response**:
```json
{
  "data": {
    "day": "Tuesday",
    "sunrise": "06:45:30",
    "sunset": "17:30:45",
    "tithi": {
      "name": "Shukla Pratipada",
      "start": "05:30:00",
      "end": "07:45:00"
    },
    "nakshatra": {
      "name": "Ashwini",
      "lord": "Ketu",
      "start": "04:20:00",
      "end": "03:45:00"
    },
    "rahu_kalam": {
      "start": "15:00:00",
      "end": "16:30:00"
    },
    "abhijit_muhurta": {
      "start": "11:45:00",
      "end": "12:33:00"
    }
    // ... more panchang data
  },
  "cached_at": "2025-12-03T15:00:00.000Z",
  "expires_at": "2025-12-03T21:00:00.000Z",
  "from_cache": false
}
```

**Cache**: 6 hours (shorter for daily changing data)

---

### 4. Compatibility

**POST** `/api/astrology/compatibility`

Get Ashtakoot compatibility score between two people.

**Request**:
```json
{
  "person1": {
    "dateTime": "1990-01-15T10:30:00",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": 5.5
  },
  "person2": {
    "dateTime": "1992-03-20T14:15:00",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timezone": 5.5
  }
}
```

**Response**:
```json
{
  "data": {
    "total_points": 28,
    "maximum_points": 36,
    "match_percentage": 77.8,
    "attributes": {
      "varna": {
        "points": 1,
        "max_points": 1,
        "description": "Spiritual compatibility"
      },
      "vashya": {
        "points": 2,
        "max_points": 2,
        "description": "Mutual attraction"
      }
      // ... 6 more attributes
    },
    "conclusion": {
      "report": "Good compatibility for marriage...",
      "compatibility_level": "Good"
    }
  },
  "cached_at": "2025-12-03T15:00:00.000Z",
  "expires_at": "2025-12-04T15:00:00.000Z",
  "from_cache": false
}
```

**Cache**: 24 hours

---

### 5. Rate Limit Info

**GET** `/api/astrology/rate-limit`

Check current API usage and rate limit status.

**Response**:
```json
{
  "daily_limit": 50,
  "used_today": 12,
  "remaining_today": 38,
  "reset_at": "2025-12-04T00:00:00.000Z",
  "last_request_at": "2025-12-03T15:30:00.000Z"
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Birth Chart
const birthChart = await fetch('/api/astrology/birth-chart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dateTime: '1990-01-15T10:30:00',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  }),
})
const data = await birthChart.json()
console.log(data.data.planets)

// Chart SVG
const chartSVG = await fetch('/api/astrology/chart-svg', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dateTime: '1990-01-15T10:30:00',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    chartType: 'D9', // Navamsa chart
  }),
})
const svg = await chartSVG.json()
document.getElementById('chart').innerHTML = svg.data.svg_code

// Panchang
const panchang = await fetch('/api/astrology/panchang', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2025-12-03',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  }),
})
const panchangData = await panchang.json()
console.log(panchangData.data.sunrise, panchangData.data.sunset)

// Compatibility
const compatibility = await fetch('/api/astrology/compatibility', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    person1: {
      dateTime: '1990-01-15T10:30:00',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    },
    person2: {
      dateTime: '1992-03-20T14:15:00',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 5.5,
    },
  }),
})
const match = await compatibility.json()
console.log(`Compatibility: ${match.data.match_percentage}%`)

// Rate Limit
const rateLimitInfo = await fetch('/api/astrology/rate-limit')
const limits = await rateLimitInfo.json()
console.log(`Remaining requests today: ${limits.remaining_today}/${limits.daily_limit}`)
```

### React Component Example

```tsx
'use client'

import { useState } from 'react'

export function BirthChartViewer() {
  const [chartSVG, setChartSVG] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchChart = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/astrology/chart-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: '1990-01-15T10:30:00',
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 5.5,
        }),
      })

      const data = await response.json()
      setChartSVG(data.data.svg_code)
    } catch (error) {
      console.error('Failed to fetch chart:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={fetchChart} disabled={loading}>
        {loading ? 'Loading...' : 'Generate Birth Chart'}
      </button>

      {chartSVG && (
        <div
          className="mt-4"
          dangerouslySetInnerHTML={{ __html: chartSVG }}
        />
      )}
    </div>
  )
}
```

---

## Rate Limiting & Caching

### Free Tier Limits
- **Daily Limit**: 50 requests per day
- **Resets**: Daily at midnight UTC
- **Overages**: API returns error when limit exceeded

### Caching Strategy

To maximize the 50 requests/day limit, we implement aggressive caching:

| Data Type | Cache Duration | Rationale |
|-----------|----------------|-----------|
| Birth Charts | 24 hours | Birth data doesn't change |
| Divisional Charts | 24 hours | Static calculation |
| Chart SVGs | 24 hours | Visual doesn't change |
| Panchang | 6 hours | Daily data, but changes slowly |
| Compatibility | 24 hours | Static calculation |
| Dasa/Strength | 24 hours | Birth-based, doesn't change |

### Cache Key Strategy

Cache keys are generated based on:
- Birth date/time (down to the second)
- Location coordinates (rounded to 4 decimal places ≈ 11 meters)
- Timezone
- Chart configuration (ayanamsha, observation point)

**Example Cache Key**:
```
astro:birth-chart:1990-1-15T10:30:0:28.6139:77.2090:5.5:topocentric:lahiri
```

### Monitoring Usage

```bash
# Check current rate limit status
curl http://localhost:3000/api/astrology/rate-limit

# Check cache statistics
curl http://localhost:3000/api/metrics | jq '.cache'
```

---

## Configuration

### Environment Variables

Required in `.env.local`:

```bash
# FreeAstrologyAPI.com
FREE_ASTROLOGY_API_KEY=your_api_key_here
```

### Ayanamsha Options

Supported Ayanamsha systems:
- `lahiri` (default) - Lahiri/Chitrapaksha
- `raman` - Raman
- `krishnamurti` - KP System
- `thirukanitham` - Thirukanitham

### Observation Point

- `topocentric` (default) - Based on observer's location
- `geocentric` - Based on Earth's center

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Common Errors

**400 Bad Request**:
```json
{
  "error": "Missing required fields",
  "required": ["dateTime", "latitude", "longitude", "timezone"]
}
```

**429 Too Many Requests** (Rate Limit Exceeded):
```json
{
  "error": "Daily API rate limit exceeded (50/50). Resets at 2025-12-04T00:00:00.000Z"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to fetch birth chart",
  "message": "API request failed: 500 - Internal Server Error"
}
```

---

## Best Practices

### 1. Check Rate Limits Before Making Requests

```typescript
const { remaining_today } = await fetch('/api/astrology/rate-limit').then(r => r.json())

if (remaining_today < 5) {
  // Warn user about low remaining requests
  console.warn('Low API quota remaining')
}
```

### 2. Leverage Caching

The API automatically caches all responses. Repeated requests with the same parameters will be served from cache without consuming your quota.

### 3. Batch Requests

If you need multiple charts for the same person, fetch them all at once instead of making sequential requests throughout the day.

### 4. Monitor Usage

Set up monitoring for:
- Daily quota usage
- Cache hit rate
- API errors

```bash
# Monitor in real-time
watch -n 60 'curl -s http://localhost:3000/api/astrology/rate-limit'
```

### 5. Production Considerations

For production with multiple users:

- **Redis Cache**: Replace in-memory cache with Redis
- **Database Storage**: Store frequently accessed charts in database
- **Rate Limit Per User**: Implement user-level quotas
- **Paid Plan**: Consider upgrading for higher limits

---

## Troubleshooting

### Issue: Rate Limit Exceeded

**Symptom**: Error "Daily API rate limit exceeded"

**Solutions**:
1. Check cache hit rate: `curl http://localhost:3000/api/metrics | jq '.cache'`
2. Verify cache is working: Same request twice should hit cache
3. Wait for daily reset (check `reset_at` in rate limit response)
4. Consider upgrading to paid plan

### Issue: Slow Response Times

**Symptom**: API requests taking > 5 seconds

**Solutions**:
1. First request is slow (API call), subsequent requests fast (cache)
2. Check network connectivity to FreeAstrologyAPI.com
3. Monitor with: `curl -s http://localhost:3000/api/metrics | jq '.slowOperations'`

### Issue: Invalid Coordinates

**Symptom**: Error "Invalid latitude/longitude"

**Solutions**:
- Latitude: -90 to 90
- Longitude: -180 to 180
- Use decimal degrees (not DMS format)

---

## API Client Architecture

```
User Request
    ↓
API Route Handler
    ↓
CachedAstrologyAPIClient (24hr cache)
    ↓
AstrologyAPIClient (rate limit tracking)
    ↓
FreeAstrologyAPI.com (50 req/day)
```

**Files**:
- `lib/astrology/types.ts` - TypeScript types
- `lib/astrology/client.ts` - Base API client with rate limiting
- `lib/astrology/cached-client.ts` - Caching wrapper
- `app/api/astrology/*` - API route handlers

---

## Resources

- [FreeAstrologyAPI Documentation](https://freeastrologyapi.com/api-reference)
- [Vedic Astrology Concepts](https://en.wikipedia.org/wiki/Jyotisha)
- [Ashtakoot Compatibility](https://en.wikipedia.org/wiki/Ashtakoot_System)

---

**Last Updated**: 2025-12-03
**API Version**: 1.0.0
**Integration Status**: ✅ Production Ready
