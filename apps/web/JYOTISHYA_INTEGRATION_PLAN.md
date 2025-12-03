# Jyotishya Platform - FreeAstrologyAPI Integration Plan

## Executive Summary

FreeAstrologyAPI.com provides **100+ endpoints** covering comprehensive Vedic and Western astrology calculations. This plan outlines a phased integration approach optimized for the Jyotishya platform, prioritizing features by business value and user demand while respecting rate limits.

**API Characteristics**:
- **Total Endpoints**: 100+ (Indian Vedic + Western + Panchang)
- **Free Tier**: Daily rate limit (exact limit TBD - typically 50-100 requests/day)
- **Format**: JSON (POST requests)
- **Authentication**: API key in header

---

## Phase 1: Core Features (MVP) - CURRENT

### 1.1 Essential Endpoints (Highest Priority)

| Feature | Endpoint | Cache TTL | Business Value | User Demand |
|---------|----------|-----------|----------------|-------------|
| **Birth Chart** | `/planets` | 24h | ⭐⭐⭐⭐⭐ | Very High |
| **Chart Visualization** | `/horoscope-chart-svg-code` | 24h | ⭐⭐⭐⭐⭐ | Very High |
| **Navamsa (D9)** | `/navamsa-chart-info` | 24h | ⭐⭐⭐⭐ | High |
| **Navamsa SVG** | `/navamsa-chart-svg-code` | 24h | ⭐⭐⭐⭐ | High |
| **Daily Panchang** | Multiple endpoints | 6h | ⭐⭐⭐⭐⭐ | Very High |
| **Compatibility** | `/match-making/ashtakoot-score` | 24h | ⭐⭐⭐⭐⭐ | Very High |

**Estimated Daily API Usage**: 10-20 requests (with caching)

### 1.2 Panchang Integration Strategy

**Challenge**: Panchang has **15+ individual endpoints** instead of one combined endpoint (deprecated).

**Solution**: Create a **smart aggregator** that:
1. Caches individual panchang components separately
2. Combines them on-demand
3. Only fetches missing components

**Panchang Endpoints to Integrate**:

```typescript
// Core Timings (Must Have)
- /sun-rise-set          // Sunrise/sunset
- /tithi-timings         // Lunar day
- /nakshatra-timings     // Lunar constellation
- /yoga-timings          // Yoga period
- /karana-timings        // Half-tithi

// Calendar Info (Must Have)
- /vedic-weekday         // Day name
- /lunar-month           // Lunar month
- /samvat-info          // Year calculations
- /aayanam              // Solar period

// Auspicious Times (High Value)
- /abhijit-muhurat      // Best time
- /brahma-muhurat       // Pre-dawn
- /hora-timings         // Planetary hours
- /choghadiya-timings   // 8 time periods

// Inauspicious Times (High Value)
- /rahu-kalam           // Rahu period
- /yama-gandam          // Yama period
- /gulika-kalam         // Gulika period
- /dur-muhurat          // Bad times
- /varjyam              // Times to avoid
```

**Optimization**: Implement **parallel fetching** for all panchang components to minimize total time.

---

## Phase 2: Advanced Features (Next 3 Months)

### 2.1 Career & Life Analysis

| Feature | Endpoint | Cache TTL | Priority |
|---------|----------|-----------|----------|
| **D10 Chart (Career)** | `/d10-chart-info` + `/d10-chart-svg-code` | 24h | High |
| **Vimsottari Dasa** | `/vimsottari-maha-dasa` | 24h | High |
| **Dasa Periods** | `/vimsottari-antar-dasa` | 24h | Medium |
| **Current Dasa** | `/date-wise-dasa` | 1h | Medium |
| **Planetary Strength** | `/shad-bala-summary` | 24h | Medium |

**Business Value**: Enables astrologer consultations and detailed life predictions.

### 2.2 Specialized Divisional Charts

**Priority Order** (based on user demand):

1. **D9 (Navamsa)** - Marriage/Dharma ✅ *Already in Phase 1*
2. **D10 (Dasamsa)** - Career
3. **D7 (Saptamsa)** - Children
4. **D12 (Dwadasamsa)** - Parents
5. **D60 (Shashtyamsa)** - Overall karma
6. **D24 (Siddhamsa)** - Education
7. **D20 (Vimsamsa)** - Spiritual pursuits
8. **D16 (Shodasamsa)** - Vehicles/happiness
9. **D30 (Trimsamsa)** - Misfortunes

**Each divisional chart has 3 endpoints**:
- `/{chart}-chart-info` - Data
- `/{chart}-chart-svg-code` - Visualization
- `/{chart}-chart-url` - Pre-generated image URL

**Implementation Strategy**:
- Create **generic divisional chart component**
- Support on-demand loading
- Cache all charts for 24 hours
- Allow astrologers to enable/disable specific charts

---

## Phase 3: Premium Features (Months 4-6)

### 3.1 Western Astrology Integration

| Feature | Endpoint | Cache TTL | Target Audience |
|---------|----------|-----------|-----------------|
| **Tropical Planets** | `/western/planets` | 24h | Western users |
| **Houses** | `/western/houses` | 24h | Western users |
| **Aspects** | `/western/aspects` | 24h | Western users |
| **Natal Wheel** | `/western/natal-wheel-chart` | 24h | Western users |

**Market Opportunity**: Expand to international markets (US, Europe).

**Languages Supported**: English, Spanish, French, Portuguese, Russian, German, Japanese, Polish, Turkish

### 3.2 Advanced Timing Analysis

| Feature | Endpoint | Cache TTL | Use Case |
|---------|----------|-----------|----------|
| **Hora Timings** | `/hora-timings` | 6h | Detailed muhurat selection |
| **Choghadiya** | `/choghadiya-timings` | 6h | Travel timing |
| **Amrit Kaal** | `/amrit-kaal` | 6h | Auspicious ceremonies |

### 3.3 Detailed Strength Analysis

| Feature | Endpoint | Cache TTL | For Whom |
|---------|----------|-----------|----------|
| **Shad Bala Breakup** | `/shad-bala-breakup` | 24h | Professional astrologers |
| **Sthana Bala** | `/sthana-bala` | 24h | Advanced users |
| **Kaala Bala** | `/kaala-bala` | 24h | Advanced users |
| **Dig Bala** | `/dig-bala` | 24h | Advanced users |

---

## Architecture & Data Flow

### Optimal Architecture for Jyotishya

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js API Route Handler                     │
│                   /api/astrology/[feature]                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Check PostgreSQL Database                      │
│              (Permanent storage for user charts)                 │
│                      TTL: Infinite                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (cache miss)
┌─────────────────────────────────────────────────────────────────┐
│                      Check Redis Cache                           │
│                   (24hr cache for charts,                        │
│                    6hr cache for panchang)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (cache miss)
┌─────────────────────────────────────────────────────────────────┐
│                   Rate Limit Check Layer                         │
│              (Track daily quota: 50/100 limit)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (quota available)
┌─────────────────────────────────────────────────────────────────┐
│                  FreeAstrologyAPI Client                         │
│            (Retry logic + Performance monitoring)                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FreeAstrologyAPI.com                            │
│                  (External API - 100+ endpoints)                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           Store Result in Redis + PostgreSQL                     │
│                    Return to User                                │
└─────────────────────────────────────────────────────────────────┘
```

### Caching Strategy by Data Type

| Data Type | PostgreSQL | Redis | API Call | Rationale |
|-----------|-----------|-------|----------|-----------|
| **User's Birth Chart** | ✅ Forever | ✅ 24h | Once | User data - store permanently |
| **Divisional Charts** | ✅ Forever | ✅ 24h | Once per chart | Static calculation |
| **Today's Panchang** | ❌ | ✅ 6h | 4x/day | Changes daily |
| **Compatibility Report** | ✅ Forever | ✅ 24h | Once per pair | Static calculation |
| **Dasa Periods** | ✅ Forever | ✅ 24h | Once | Birth-based, static |
| **Current Dasa** | ❌ | ✅ 1h | 24x/day | Changes with time |

---

## Rate Limit Handling Strategy

### Problem
- **Free Tier**: Limited daily requests (likely 50-100/day)
- **100+ endpoints** available
- **Multiple users** accessing simultaneously

### Solution: Multi-Layer Caching + Smart Request Management

#### 1. Database-First Approach

```typescript
async function getBirthChart(userId: string, birthData: BirthDetails) {
  // Layer 1: Check PostgreSQL (user's saved charts)
  const savedChart = await db.birthChart.findUnique({
    where: { userId_birthDateTime: { userId, birthDateTime } }
  })

  if (savedChart) {
    return { ...savedChart, from_database: true }
  }

  // Layer 2: Check Redis cache (24hr)
  const cachedChart = await redis.get(cacheKey)

  if (cachedChart) {
    // Save to database for future
    await db.birthChart.create({ data: chartData })
    return { ...cachedChart, from_cache: true }
  }

  // Layer 3: API call (only if not in DB or cache)
  const apiChart = await astrologyAPI.getBirthChart(birthData)

  // Save to both database and cache
  await Promise.all([
    db.birthChart.create({ data: apiChart }),
    redis.setex(cacheKey, 86400, apiChart)
  ])

  return { ...apiChart, from_api: true }
}
```

#### 2. Panchang Aggregation Strategy

**Challenge**: 15+ separate endpoints for complete panchang

**Solution**: Parallel fetching with component-level caching

```typescript
async function getCompletePanchang(date: Date, location: Location) {
  const components = [
    'sun-rise-set',
    'tithi-timings',
    'nakshatra-timings',
    'yoga-timings',
    'karana-timings',
    'vedic-weekday',
    'lunar-month',
    'abhijit-muhurat',
    'brahma-muhurat',
    'rahu-kalam',
    'hora-timings',
    'choghadiya-timings',
  ]

  // Fetch all components in parallel (12 simultaneous requests)
  const results = await Promise.allSettled(
    components.map(component =>
      getCachedPanchangComponent(component, date, location)
    )
  )

  // Combine results
  return combinePanchangData(results)
}

async function getCachedPanchangComponent(
  component: string,
  date: Date,
  location: Location
) {
  const cacheKey = `panchang:${component}:${date}:${location}`

  // Check Redis (6 hour cache)
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  // API call
  const data = await astrologyAPI.call(`/${component}`, { date, location })

  // Cache for 6 hours
  await redis.setex(cacheKey, 21600, data)

  return data
}
```

**Result**: Complete panchang uses **1-12 API calls** (depending on cache hits), but each component is cached independently for 6 hours.

#### 3. Rate Limit Quota Management

```typescript
class SmartRateLimiter {
  private readonly DAILY_LIMIT = 50 // Adjust based on actual limit
  private readonly RESERVE_QUOTA = 10 // Emergency reserve

  async canMakeRequest(priority: 'high' | 'medium' | 'low'): Promise<boolean> {
    const used = await this.getUsedToday()
    const remaining = this.DAILY_LIMIT - used

    // Always allow high priority (user's first chart)
    if (priority === 'high') return remaining > 0

    // Allow medium priority if enough quota
    if (priority === 'medium') return remaining > this.RESERVE_QUOTA

    // Allow low priority only if plenty of quota
    if (priority === 'low') return remaining > (this.RESERVE_QUOTA * 2)

    return false
  }

  async requestWithPriority<T>(
    operation: () => Promise<T>,
    priority: 'high' | 'medium' | 'low'
  ): Promise<T> {
    if (!await this.canMakeRequest(priority)) {
      throw new Error(`Rate limit: Cannot make ${priority} priority request`)
    }

    return await operation()
  }
}
```

**Priority Levels**:
- **High**: User's first birth chart, paid consultations
- **Medium**: Divisional charts, compatibility for logged-in users
- **Low**: Free panchang for anonymous users

#### 4. Predictive Quota Management

```typescript
// Pre-fetch popular data during low-traffic hours
async function prefetchPopularCharts() {
  const hour = new Date().getHours()

  // Run between 2 AM - 5 AM when traffic is low
  if (hour >= 2 && hour < 5) {
    const popularLocations = await getPopularLocations()

    for (const location of popularLocations) {
      const today = new Date()

      // Pre-fetch today's panchang for popular cities
      await getCompletePanchang(today, location)

      // This uses API quota but ensures cache is warm for users
    }
  }
}
```

---

## Data Structures & Storage

### Database Schema (PostgreSQL)

```sql
-- User birth charts (permanent storage)
CREATE TABLE birth_charts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  birth_date_time TIMESTAMPTZ NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  timezone DECIMAL(4, 2) NOT NULL,

  -- Chart data (JSONB for flexibility)
  planets JSONB NOT NULL,
  houses JSONB NOT NULL,
  ascendant DECIMAL(10, 4),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ,
  access_count INT DEFAULT 0,

  -- Composite unique constraint
  UNIQUE(user_id, birth_date_time, latitude, longitude)
);

-- Divisional charts
CREATE TABLE divisional_charts (
  id UUID PRIMARY KEY,
  birth_chart_id UUID REFERENCES birth_charts(id) ON DELETE CASCADE,
  chart_type VARCHAR(10) NOT NULL, -- D2, D9, D10, etc.
  chart_data JSONB NOT NULL,
  svg_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(birth_chart_id, chart_type)
);

-- Compatibility reports
CREATE TABLE compatibility_reports (
  id UUID PRIMARY KEY,
  person1_chart_id UUID REFERENCES birth_charts(id),
  person2_chart_id UUID REFERENCES birth_charts(id),
  ashtakoot_score INT NOT NULL,
  match_percentage DECIMAL(5, 2),
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(person1_chart_id, person2_chart_id)
);

-- Panchang cache (optional - primarily use Redis)
CREATE TABLE panchang_cache (
  id UUID PRIMARY KEY,
  date DATE NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  panchang_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(date, latitude, longitude)
);

-- API usage tracking
CREATE TABLE api_usage_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  endpoint VARCHAR(255) NOT NULL,
  request_data JSONB,
  response_status INT,
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_usage_date ON api_usage_log(DATE(created_at));
CREATE INDEX idx_birth_charts_user ON birth_charts(user_id);
CREATE INDEX idx_birth_charts_datetime ON birth_charts(birth_date_time);
```

### Redis Cache Keys Structure

```typescript
// Cache key patterns
const CACHE_KEYS = {
  birthChart: (birthData) =>
    `astro:chart:${birthData.year}-${birthData.month}-${birthData.date}T${birthData.hours}:${birthData.minutes}:${birthData.seconds}:${birthData.latitude.toFixed(4)}:${birthData.longitude.toFixed(4)}`,

  divisionalChart: (birthData, chartType) =>
    `astro:div:${chartType}:${CACHE_KEYS.birthChart(birthData)}`,

  panchangComponent: (component, date, location) =>
    `astro:panchang:${component}:${date.toISOString().split('T')[0]}:${location.latitude.toFixed(2)}:${location.longitude.toFixed(2)}`,

  compatibility: (person1, person2) =>
    `astro:compat:${CACHE_KEYS.birthChart(person1)}:${CACHE_KEYS.birthChart(person2)}`,

  rateLimit: (date) =>
    `astro:ratelimit:${date.toISOString().split('T')[0]}`,
}

// Cache TTLs (in seconds)
const CACHE_TTL = {
  birthChart: 86400,        // 24 hours
  divisionalChart: 86400,   // 24 hours
  panchangComponent: 21600, // 6 hours
  compatibility: 86400,     // 24 hours
  currentDasa: 3600,        // 1 hour
}
```

---

## API Usage Estimates

### Expected Daily API Calls by Feature

| Feature | Calls per User | Cache Hit Rate | Net API Calls | Priority |
|---------|----------------|----------------|---------------|----------|
| **Birth Chart (first time)** | 1 | 0% | 1 | High |
| **Birth Chart (repeat)** | 0 | 100% | 0 | - |
| **D9 Chart** | 1 | 95% | 0.05 | Medium |
| **Other Div Charts** | 5 | 95% | 0.25 | Low |
| **Panchang (Today)** | 12 components | 80% | 2.4 | High |
| **Compatibility** | 1 | 90% | 0.1 | High |
| **Dasa Periods** | 1 | 95% | 0.05 | Medium |

**Per 100 Active Users/Day**:
- New users (20): 20 birth charts + 20 D9 + 20 compatibility = **60 calls**
- Returning users (80): 80 × 2.4 (panchang) = **192 calls**
- **Total**: 252 calls ❌ **EXCEEDS LIMIT**

### Optimization to Stay Within Limits

**Strategy 1: Location-Based Panchang Sharing**
- Cache panchang by **city** (not precise coordinates)
- Round coordinates to 0.1 degree (~11km precision)
- **Result**: 192 calls → **20 calls** (10 major cities)

**Strategy 2: Pre-fetch During Off-Hours**
- Fetch panchang for top 10 cities at 3 AM daily
- **Result**: 10 cities × 12 components = **120 calls** (off-peak)

**Strategy 3: Database-First for Charts**
- Store all user charts permanently
- **Result**: Only 20 new user charts/day = **20 calls**

**Revised Daily Usage**:
- New user birth charts: 20 calls
- New user compatibility: 10 calls
- Panchang (pre-fetched): 120 calls (off-peak)
- Panchang (on-demand): 10 calls
- **Total**: **40 calls (peak) + 120 calls (off-peak)** ✅ **WITHIN LIMIT**

---

## Implementation Roadmap

### Week 1-2: Enhanced Core (Building on Current)

**Goal**: Optimize existing integration

- [x] Basic birth chart endpoint ✅ **Already done**
- [x] Chart SVG endpoint ✅ **Already done**
- [x] Panchang endpoint ✅ **Already done**
- [x] Compatibility endpoint ✅ **Already done**
- [x] Rate limit tracking ✅ **Already done**
- [ ] **Add PostgreSQL storage for charts**
- [ ] **Implement panchang component aggregator**
- [ ] **Add Redis cache layer**
- [ ] **Create location-based caching (round coordinates)**

### Week 3-4: Divisional Charts

- [ ] D9 (Navamsa) endpoints
- [ ] D10 (Dasamsa) endpoints
- [ ] Generic divisional chart component
- [ ] Chart comparison UI
- [ ] Astrologer dashboard for multiple charts

### Month 2: Panchang Enhancement

- [ ] Individual panchang component endpoints (15+)
- [ ] Parallel fetching aggregator
- [ ] Auspicious timing calculator
- [ ] Muhurat selection tool
- [ ] Daily panchang calendar view

### Month 3: Advanced Features

- [ ] Vimsottari Dasa endpoints
- [ ] Current dasa calculator
- [ ] Dasa timeline visualization
- [ ] Shad Bala strength analysis
- [ ] Planetary period predictions

### Month 4-6: Premium Features

- [ ] Western astrology endpoints
- [ ] Multi-language support
- [ ] All 16 divisional charts
- [ ] PDF report generation (when available)
- [ ] Advanced timing tools (Hora, Choghadiya)

---

## Business Model Integration

### Monetization Strategy

**Free Tier** (Anonymous/Basic Users):
- Basic birth chart (D1)
- Today's panchang (limited cities)
- Basic compatibility
- **API Usage**: ~5 calls/user

**Premium Tier** ($9.99/month):
- All divisional charts (D2-D60)
- Unlimited compatibility checks
- Dasa period analysis
- Detailed panchang for any location
- PDF reports (when available)
- **API Usage**: ~20 calls/user

**Professional Tier** ($49.99/month - Astrologers):
- Everything in Premium
- Western astrology
- Bulk chart generation
- API access for their apps
- Priority support
- **API Usage**: ~50 calls/user

**API Usage Allocation**:
- Free users: 60% of quota (30 calls)
- Premium users: 30% of quota (15 calls)
- Professional users: 10% of quota (5 calls)
- System/pre-fetch: Off-peak hours

---

## Monitoring & Analytics

### Key Metrics to Track

**API Usage**:
- Daily API calls by endpoint
- Cache hit rate by feature
- Average response time
- Error rate by endpoint
- Quota remaining (alert at < 20%)

**User Behavior**:
- Most requested divisional charts
- Popular panchang timings
- Compatibility check frequency
- Chart generation patterns

**Performance**:
- Database query time
- Redis cache latency
- API request duration
- End-to-end response time

### Dashboards to Create

1. **Rate Limit Dashboard**
   - Current quota usage
   - Hourly trend
   - Projected daily usage
   - Alert when > 80%

2. **Cache Performance Dashboard**
   - Hit rate by feature
   - Cache size
   - Most cached items
   - Stale data count

3. **User Engagement Dashboard**
   - Charts generated per user
   - Feature usage distribution
   - Conversion funnel (free → premium)

---

## Risk Mitigation

### Risk 1: Rate Limit Exceeded

**Impact**: Service degradation, blocked API

**Mitigation**:
1. Multi-layer caching (DB + Redis)
2. Smart quota management
3. Priority-based request handling
4. Upgrade to paid plan if needed
5. Fallback to cached/stale data

**Alert Threshold**: 80% quota used

### Risk 2: API Downtime

**Impact**: Cannot generate new charts

**Mitigation**:
1. Serve from database/cache
2. Show "temporarily unavailable" for new requests
3. Queue requests for retry
4. Monitor API status page

**SLA**: 99.9% uptime (3rd party dependency)

### Risk 3: Cache Failures

**Impact**: Increased API usage

**Mitigation**:
1. Fallback to database
2. Reduce cache TTL temporarily
3. Implement cache warming
4. Redis cluster for redundancy

### Risk 4: Database Storage Growth

**Impact**: Increased costs

**Mitigation**:
1. Archive old charts (> 1 year inactive)
2. Compress JSONB data
3. Implement data retention policy
4. Use partitioning for large tables

---

## Success Criteria

### Phase 1 (Month 1)
- [ ] 90%+ cache hit rate for birth charts
- [ ] < 40 API calls/day during peak
- [ ] < 500ms response time (cached)
- [ ] Zero rate limit errors
- [ ] 100 active users supported

### Phase 2 (Month 3)
- [ ] 95%+ cache hit rate overall
- [ ] Support 500 active users
- [ ] All divisional charts integrated
- [ ] Complete panchang system
- [ ] < 2s response time for new charts

### Phase 3 (Month 6)
- [ ] Support 2000 active users
- [ ] Western astrology integrated
- [ ] Multi-language support
- [ ] Premium features launched
- [ ] 98%+ cache hit rate

---

## Conclusion

This integration plan provides a strategic, phased approach to leveraging FreeAstrologyAPI.com's comprehensive features while respecting rate limits through intelligent caching, database storage, and smart quota management.

**Key Success Factors**:
1. **Database-first architecture** for permanent chart storage
2. **Multi-layer caching** (PostgreSQL + Redis)
3. **Smart panchang aggregation** with component-level caching
4. **Priority-based quota management**
5. **Pre-fetching during off-peak hours**

**Expected Outcome**: Support 100+ daily active users within free tier limits while providing comprehensive astrology features.

---

**Document Version**: 1.0
**Last Updated**: 2025-12-03
**Status**: Ready for Implementation
