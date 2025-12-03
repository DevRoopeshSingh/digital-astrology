# Jyotishya - Quick Start Guide

## Immediate Actions (This Week)

### 1. Verify API Key ⚠️ **URGENT**

Test your API key directly:

```bash
curl -X POST https://json.freeastrologyapi.com/planets \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: kWKtgOH3Ula2jOEdDCPIA99N7zrKavERbZu3VH78' \
  -d '{
    "year": 2025, "month": 12, "date": 3,
    "hours": 10, "minutes": 30, "seconds": 0,
    "latitude": 28.6139, "longitude": 77.2090, "timezone": 5.5,
    "settings": {
      "observation_point": "topocentric",
      "ayanamsha": "lahiri"
    }
  }'
```

**If 403 Forbidden**: Contact FreeAstrologyAPI.com support to activate key.

---

### 2. Add Database Storage (Next Priority)

**Why**: Permanent chart storage saves API quota.

**Migration**: Create these tables:

```sql
-- Run in your PostgreSQL database
CREATE TABLE birth_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  birth_date_time TIMESTAMPTZ NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  timezone DECIMAL(4, 2) NOT NULL,
  planets JSONB NOT NULL,
  houses JSONB,
  ascendant DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, birth_date_time, latitude, longitude)
);

CREATE TABLE divisional_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  birth_chart_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  chart_type VARCHAR(10) NOT NULL,
  chart_data JSONB NOT NULL,
  svg_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(birth_chart_id, chart_type)
);

CREATE TABLE compatibility_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person1_chart_id UUID REFERENCES birth_charts(id),
  person2_chart_id UUID REFERENCES birth_charts(id),
  ashtakoot_score INT,
  match_percentage DECIMAL(5, 2),
  report_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(person1_chart_id, person2_chart_id)
);

CREATE INDEX idx_birth_charts_user ON birth_charts(user_id);
```

---

### 3. Install Redis (Production-Ready Caching)

**Local Development**:
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

**Add Redis Client**:
```bash
cd apps/web
yarn add ioredis
```

**Update .env.local**:
```bash
REDIS_URL=redis://localhost:6379
```

---

## Current API Endpoints (Ready to Use)

| Endpoint | Method | Purpose | Cache | Status |
|----------|--------|---------|-------|--------|
| `/api/astrology/birth-chart` | POST | Birth chart | 24h | ✅ |
| `/api/astrology/chart-svg` | POST | SVG visualization | 24h | ✅ |
| `/api/astrology/panchang` | POST | Vedic calendar | 6h | ✅ |
| `/api/astrology/compatibility` | POST | Match-making | 24h | ✅ |
| `/api/astrology/rate-limit` | GET | Quota status | - | ✅ |

---

## Next Endpoints to Add (Priority Order)

### Week 1: Panchang Components

Add these 12 individual endpoints (currently we only have combined panchang):

```typescript
// apps/web/app/api/astrology/panchang-components/route.ts

export async function POST(request: Request) {
  const { component, date, latitude, longitude, timezone } = await request.json()

  const components = {
    'sun-rise-set': '/sun-rise-set',
    'tithi': '/tithi-timings',
    'nakshatra': '/nakshatra-timings',
    'yoga': '/yoga-timings',
    'karana': '/karana-timings',
    'abhijit': '/abhijit-muhurat',
    'brahma-muhurat': '/brahma-muhurat',
    'rahu-kalam': '/rahu-kalam',
    'hora': '/hora-timings',
    'choghadiya': '/choghadiya-timings',
  }

  const endpoint = components[component]
  // Make API call to specific component
  // Cache for 6 hours
  // Return data
}
```

### Week 2: Navamsa Chart (D9)

```typescript
// apps/web/app/api/astrology/navamsa/route.ts

export async function POST(request: Request) {
  // Endpoint: /navamsa-chart-info
  // Cache: 24 hours
  // Used for: Marriage predictions
}
```

### Week 3: Dasamsa Chart (D10)

```typescript
// apps/web/app/api/astrology/dasamsa/route.ts

export async function POST(request: Request) {
  // Endpoint: /d10-chart-info
  // Cache: 24 hours
  // Used for: Career analysis
}
```

### Week 4: Vimsottari Dasa

```typescript
// apps/web/app/api/astrology/dasa/route.ts

export async function POST(request: Request) {
  // Endpoint: /vimsottari-maha-dasa
  // Cache: 24 hours
  // Used for: Life period predictions
}
```

---

## Usage Examples

### React Component: Birth Chart Viewer

```tsx
'use client'

import { useState } from 'react'

export function BirthChartViewer({ userId }: { userId: string }) {
  const [chart, setChart] = useState(null)
  const [loading, setLoading] = useState(false)

  const generateChart = async (birthData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/astrology/birth-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthData),
      })

      const data = await response.json()

      // Show if from cache or fresh API call
      if (data.from_cache) {
        console.log('Served from cache - no API quota used ✅')
      } else {
        console.log('Fresh API call - quota used ⚠️')
      }

      setChart(data.data)
    } catch (error) {
      console.error('Failed to generate chart:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Birth data form */}
      {/* Chart display */}
      {chart && (
        <div>
          <h3>Your Birth Chart</h3>
          {chart.planets.map(planet => (
            <div key={planet.name}>
              {planet.name}: {planet.sign} at {planet.normDegree}°
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Server Action: Save Chart to Database

```typescript
// app/actions/astrology.ts
'use server'

import { prisma } from '@/lib/db/prisma'

export async function saveUserChart(
  userId: string,
  birthData: BirthDetails,
  chartData: any
) {
  // Save to database for permanent storage
  const chart = await prisma.birthChart.create({
    data: {
      userId,
      birthDateTime: new Date(
        birthData.year, birthData.month - 1, birthData.date,
        birthData.hours, birthData.minutes, birthData.seconds
      ),
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      timezone: birthData.timezone,
      planets: chartData.planets,
      houses: chartData.houses,
      ascendant: chartData.ascendant,
    },
  })

  return chart
}

export async function getUserChart(userId: string) {
  // Retrieve from database (no API quota used!)
  return await prisma.birthChart.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}
```

---

## API Quota Management

### Check Quota Status

```bash
# Check remaining requests
curl http://localhost:3000/api/astrology/rate-limit

# Response:
{
  "daily_limit": 50,
  "used_today": 12,
  "remaining_today": 38,
  "reset_at": "2025-12-04T00:00:00.000Z"
}
```

### Alert When Low

```typescript
// Add to cron job or monitoring script
async function checkQuota() {
  const response = await fetch('/api/astrology/rate-limit')
  const { remaining_today } = await response.json()

  if (remaining_today < 10) {
    // Send alert to Slack/Email
    await sendAlert(
      `⚠️ Low API quota: ${remaining_today} requests remaining`
    )
  }
}

// Run every hour
setInterval(checkQuota, 3600000)
```

---

## Optimization Checklist

**Immediate (This Week)**:
- [ ] Verify API key works
- [ ] Add PostgreSQL storage for charts
- [ ] Install and configure Redis
- [ ] Update cache to use Redis instead of memory

**Next Week**:
- [ ] Implement database-first lookup
- [ ] Add panchang component endpoints
- [ ] Create location-based panchang caching (round coordinates)
- [ ] Test with 10 concurrent users

**Month 1**:
- [ ] Add Navamsa (D9) chart endpoint
- [ ] Add Dasamsa (D10) chart endpoint
- [ ] Implement Vimsottari Dasa endpoint
- [ ] Create pre-fetching cron job for popular cities

**Month 2-3**:
- [ ] Add remaining divisional charts
- [ ] Western astrology endpoints
- [ ] Multi-language support
- [ ] PDF report generation

---

## Common Issues & Solutions

### Issue: API Returns 403

**Cause**: API key not activated or incorrect

**Solution**:
1. Verify key in .env.local matches exactly
2. Test key directly with curl (see above)
3. Contact FreeAstrologyAPI.com support
4. Check if account needs email verification

### Issue: Slow Response (>3s)

**Cause**: First API call, not cached

**Solution**:
1. Normal for first request
2. Subsequent requests should be <100ms (cached)
3. Check cache is working: `curl /api/metrics | jq '.cache'`

### Issue: Rate Limit Exceeded

**Cause**: Too many API calls

**Solution**:
1. Check cache hit rate (should be >90%)
2. Verify database storage is working
3. Implement location-based caching for panchang
4. Enable pre-fetching during off-hours
5. Consider upgrading to paid plan

---

## Monitoring Commands

```bash
# Check cache statistics
curl http://localhost:3000/api/metrics | jq '.cache'

# Check API quota
curl http://localhost:3000/api/astrology/rate-limit

# Check database storage
psql $DATABASE_URL -c "SELECT COUNT(*) FROM birth_charts"

# Monitor Redis
redis-cli INFO stats
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Cache Hit Rate | >90% | TBD |
| Response Time (Cached) | <100ms | TBD |
| Response Time (API) | <2s | TBD |
| Daily API Calls | <40 | 0 |
| Database Charts | Growing | 0 |
| Error Rate | <0.1% | 0% |

---

## Support & Resources

- **Integration Plan**: `JYOTISHYA_INTEGRATION_PLAN.md`
- **API Documentation**: `FREE_ASTROLOGY_API.md`
- **Current Implementation**: `ASTROLOGY_API_SUMMARY.md`
- **Official Docs**: https://freeastrologyapi.com/api-reference
- **Postman Collection**: https://documenter.getpostman.com/view/14646401/2sA3XMkQ26

---

**Quick Start Version**: 1.0
**Last Updated**: 2025-12-03
