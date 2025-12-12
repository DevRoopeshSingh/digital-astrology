/* eslint-disable @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
'use client'

import { useState } from 'react'
import DateTimePicker from './datetime-picker'
import LocationPicker from './location-picker'
import {
  downloadChartAsPNG,
  downloadChartAsPDF,
  generateShareLink,
  copyToClipboard,
} from '@/lib/utils/chart-download'
import {
  trackChartGenerated,
  trackChartSaved,
  trackChartDownloadedPNG,
  trackChartDownloadedPDF,
  trackChartShared,
} from '@/lib/analytics/events'

interface BirthChartGeneratorProps {
  userId: string
  userEmail: string
}

interface BirthData {
  dateTime: string
  latitude: number
  longitude: number
  timezone: number
  location: string
  chartName?: string
}

interface Planet {
  name: string
  fullDegree: number
  normDegree: number
  speed?: number
  isRetro: string | boolean
  sign?: string
  signLord?: string
  nakshatra?: string
  nakshatraLord?: string
  house?: number
}

interface BirthChartResponse {
  data: {
    statusCode?: number
    input?: unknown
    output?: unknown[]
    ascendant?: number
    planets?: Planet[]
    houses?: unknown[]
  }
  from_cache?: boolean
  cached_at?: string
}

interface ChartSVGResponse {
  data: {
    svg_code: string
    chart_name: string
  }
  from_cache?: boolean
}

type TabType = 'form' | 'chart' | 'divisional'

// Planet meanings for beginners
const planetMeanings: { [key: string]: { icon: string; meaning: string; area: string } } = {
  'Sun': { icon: '☀️', meaning: 'Your core self, ego, and vitality', area: 'Identity & Purpose' },
  'Moon': { icon: '🌙', meaning: 'Your emotions, mind, and instincts', area: 'Emotions & Feelings' },
  'Mars': { icon: '🔥', meaning: 'Your energy, courage, and actions', area: 'Drive & Action' },
  'Mercury': { icon: '💬', meaning: 'Your communication and intellect', area: 'Mind & Speech' },
  'Jupiter': { icon: '🎓', meaning: 'Your wisdom, luck, and growth', area: 'Expansion & Fortune' },
  'Venus': { icon: '💝', meaning: 'Your love, beauty, and relationships', area: 'Love & Pleasure' },
  'Saturn': { icon: '⏱️', meaning: 'Your discipline, karma, and lessons', area: 'Discipline & Karma' },
  'Rahu': { icon: '🌑', meaning: 'Your desires and worldly ambitions', area: 'Material Desires' },
  'Ketu': { icon: '🌑', meaning: 'Your spirituality and detachment', area: 'Spirituality' },
}

// Sign meanings
const signMeanings: { [key: string]: { element: string; nature: string; color: string } } = {
  'Aries': { element: 'Fire', nature: 'Leadership, Initiative', color: 'text-red-400' },
  'Taurus': { element: 'Earth', nature: 'Stability, Patience', color: 'text-green-400' },
  'Gemini': { element: 'Air', nature: 'Communication, Versatility', color: 'text-yellow-400' },
  'Cancer': { element: 'Water', nature: 'Nurturing, Emotions', color: 'text-blue-400' },
  'Leo': { element: 'Fire', nature: 'Confidence, Creativity', color: 'text-orange-400' },
  'Virgo': { element: 'Earth', nature: 'Analysis, Service', color: 'text-green-400' },
  'Libra': { element: 'Air', nature: 'Balance, Relationships', color: 'text-pink-400' },
  'Scorpio': { element: 'Water', nature: 'Transformation, Intensity', color: 'text-purple-400' },
  'Sagittarius': { element: 'Fire', nature: 'Philosophy, Adventure', color: 'text-orange-400' },
  'Capricorn': { element: 'Earth', nature: 'Ambition, Structure', color: 'text-gray-400' },
  'Aquarius': { element: 'Air', nature: 'Innovation, Humanity', color: 'text-cyan-400' },
  'Pisces': { element: 'Water', nature: 'Spirituality, Compassion', color: 'text-indigo-400' },
}

// House meanings for beginners
const houseMeanings: { [key: number]: { name: string; meaning: string; lifeArea: string } } = {
  1: { name: '1st House (Lagna)', meaning: 'Your personality, appearance, and how you approach life', lifeArea: 'Self & Identity' },
  2: { name: '2nd House', meaning: 'Wealth, family, speech, and values', lifeArea: 'Money & Family' },
  3: { name: '3rd House', meaning: 'Courage, siblings, communication, and short travels', lifeArea: 'Courage & Communication' },
  4: { name: '4th House', meaning: 'Mother, home, emotions, and property', lifeArea: 'Home & Emotions' },
  5: { name: '5th House', meaning: 'Children, creativity, intelligence, and romance', lifeArea: 'Creativity & Children' },
  6: { name: '6th House', meaning: 'Health, enemies, service, and daily work', lifeArea: 'Health & Service' },
  7: { name: '7th House', meaning: 'Marriage, partnerships, and business relationships', lifeArea: 'Marriage & Partnership' },
  8: { name: '8th House', meaning: 'Longevity, transformation, and hidden things', lifeArea: 'Transformation & Secrets' },
  9: { name: '9th House', meaning: 'Father, luck, spirituality, and higher learning', lifeArea: 'Luck & Spirituality' },
  10: { name: '10th House', meaning: 'Career, reputation, and public life', lifeArea: 'Career & Status' },
  11: { name: '11th House', meaning: 'Gains, friends, ambitions, and fulfillment', lifeArea: 'Gains & Friends' },
  12: { name: '12th House', meaning: 'Expenses, losses, spirituality, and foreign lands', lifeArea: 'Liberation & Foreign' },
}

export default function BirthChartGeneratorV2({ userId, userEmail }: BirthChartGeneratorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('form')
  const [showHelp, setShowHelp] = useState(true)
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null)
  const [downloadingPNG, setDownloadingPNG] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [savingChart, setSavingChart] = useState(false)
  const [savedChartId, setSavedChartId] = useState<string | null>(null)

  const [birthData, setBirthData] = useState<BirthData>({
    dateTime: '',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
    location: 'Delhi, India',
    chartName: '',
  })

  const [chartData, setChartData] = useState<BirthChartResponse | null>(null)
  const [svgData, setSvgData] = useState<{ [key: string]: ChartSVGResponse }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDivisional, setSelectedDivisional] = useState<string>('D1')

  const divisionalCharts = [
    { code: 'D1', name: 'Birth Chart', icon: '🌟', desc: 'Your life overview - Start here!', beginner: true },
    { code: 'D9', name: 'Marriage Chart', icon: '💑', desc: 'Shows your marriage & relationships', beginner: true },
    { code: 'D10', name: 'Career Chart', icon: '💼', desc: 'Reveals your profession & success', beginner: true },
    { code: 'D2', name: 'Wealth Chart', icon: '💰', desc: 'Financial prosperity', beginner: false },
    { code: 'D3', name: 'Siblings Chart', icon: '👨‍👩‍👧', desc: 'Brothers & sisters', beginner: false },
    { code: 'D4', name: 'Property Chart', icon: '🏠', desc: 'Assets & property', beginner: false },
    { code: 'D7', name: 'Children Chart', icon: '👶', desc: 'Progeny & children', beginner: false },
    { code: 'D12', name: 'Parents Chart', icon: '👨‍👩‍👦', desc: 'Mother & father', beginner: false },
  ]

  // Transform raw API response
  const transformChartData = (rawData: BirthChartResponse | Record<string, unknown>): BirthChartResponse => {
    const data = rawData.data as Record<string, unknown>
    if (data?.output && Array.isArray(data.output)) {
      const planetData = data.output[1] as Record<string, Record<string, unknown>>
      const ascendantData = (data.output[0] as Record<string, Record<string, unknown>>)?.['0']

      const planetsArray: Planet[] = []
      const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']

      planetNames.forEach(name => {
        if (planetData[name]) {
          const p = planetData[name] as Record<string, unknown>
          planetsArray.push({
            name,
            fullDegree: (p.fullDegree as number) || 0,
            normDegree: (p.normDegree as number) || 0,
            isRetro: (p.isRetro as string | boolean) || false,
            sign: getSignName((p.current_sign as number) || 1),
            house: p.house_number as number,
          })
        }
      })

      return {
        ...rawData,
        data: {
          ...data,
          ascendant: (ascendantData?.fullDegree as number) || 0,
          planets: planetsArray,
        }
      } as BirthChartResponse
    }
    return rawData as BirthChartResponse
  }

  const generateBirthChart = async () => {
    if (!birthData.dateTime) {
      setError('Please enter your birth date and time')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/astrology/birth-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate chart')
      }

      const rawData = await response.json()
      const transformedData = transformChartData(rawData)
      setChartData(transformedData)
      setActiveTab('chart')
      await fetchSVG('D1')

      // Track analytics
      trackChartGenerated({
        hasChartName: !!birthData.chartName?.trim(),
        location: birthData.location,
        timeZone: birthData.timezone.toString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchSVG = async (chartType: string) => {
    if (svgData[chartType]) return

    try {
      const response = await fetch('/api/astrology/chart-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateTime: birthData.dateTime,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone,
          chartType,
        }),
      })

      if (!response.ok) throw new Error('Failed to load chart visualization')

      const data: ChartSVGResponse = await response.json()
      setSvgData(prev => ({ ...prev, [chartType]: data }))
    } catch (err) {
      console.error(`Failed to load ${chartType}:`, err)
    }
  }

  const getSignName = (signNumber: number): string => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    return signs[(signNumber - 1) % 12] || 'Unknown'
  }

  const formatDegree = (degree: number): string => {
    const deg = Math.floor(degree)
    const min = Math.floor((degree - deg) * 60)
    return `${deg}° ${min}'`
  }

  // Download handlers
  const handleDownloadPNG = async () => {
    setDownloadingPNG(true)
    try {
      const chartName = divisionalCharts.find(c => c.code === selectedDivisional)?.name || 'Birth Chart'
      await downloadChartAsPNG('rasi-chart', {
        filename: `${chartName.replace(/\s/g, '-').toLowerCase()}-${Date.now()}.png`,
        chartName,
        birthDate: birthData.dateTime ? new Date(birthData.dateTime).toLocaleDateString('en-IN', { dateStyle: 'long' }) : undefined,
        birthPlace: birthData.location,
      })

      // Track analytics
      trackChartDownloadedPNG({ chartType: selectedDivisional })
    } catch (error) {
      console.error('PNG download failed:', error)
      alert('Failed to download chart as PNG. Please try again.')
    } finally {
      setDownloadingPNG(false)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true)
    try {
      const chartName = divisionalCharts.find(c => c.code === selectedDivisional)?.name || 'Birth Chart'
      await downloadChartAsPDF('rasi-chart', {
        filename: `${chartName.replace(/\s/g, '-').toLowerCase()}-${Date.now()}.pdf`,
        chartName,
        birthDate: birthData.dateTime ? new Date(birthData.dateTime).toLocaleDateString('en-IN', { dateStyle: 'long' }) + ' at ' + new Date(birthData.dateTime).toLocaleTimeString('en-IN', { timeStyle: 'short' }) : undefined,
        birthPlace: birthData.location,
      })

      // Track analytics
      trackChartDownloadedPDF({ chartType: selectedDivisional })
    } catch (error) {
      console.error('PDF download failed:', error)
      alert('Failed to download chart as PDF. Please try again.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleCopyShareLink = async () => {
    try {
      const shareLink = generateShareLink(birthData)
      await copyToClipboard(shareLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 3000)

      // Track analytics
      trackChartShared({ method: 'link' })
    } catch (error) {
      console.error('Failed to copy link:', error)
      alert('Failed to copy share link. Please try again.')
    }
  }

  const handleSaveChart = async () => {
    if (!chartData) {
      alert('Please generate a chart first')
      return
    }

    setSavingChart(true)
    try {
      // Generate auto name if not provided
      const chartName = birthData.chartName?.trim() ||
        `Birth Chart - ${new Date(birthData.dateTime).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}`

      const response = await fetch('/api/user/kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: chartName,
          birthDate: birthData.dateTime,
          birthTime: new Date(birthData.dateTime).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }),
          birthPlace: birthData.location,
          latitude: birthData.latitude,
          longitude: birthData.longitude,
          timezone: birthData.timezone.toString(),
          chartData: chartData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save chart')
      }

      const result = await response.json()
      setSavedChartId(result.kundli.id)

      // Track analytics
      trackChartSaved({
        chartName,
        autoGenerated: !birthData.chartName?.trim(),
      })

      // Show success message
      alert('✅ Chart saved successfully! View it in "My Kundlis" page.')

      // Reset saved message after 5 seconds
      setTimeout(() => setSavedChartId(null), 5000)
    } catch (error) {
      console.error('Failed to save chart:', error)
      alert('Failed to save chart. Please try again.')
    } finally {
      setSavingChart(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Help Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-blue-200">New to Astrology?</p>
            <p className="text-sm text-blue-300">Enable helpful explanations to understand your chart better</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`rounded-full px-4 py-2 font-semibold transition ${
            showHelp
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {showHelp ? '✓ Help On' : 'Help Off'}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${activeTab === 'form' ? 'text-orange-400' : 'text-green-400'}`}>
            <span className="text-2xl">{activeTab === 'form' ? '1️⃣' : '✓'}</span>
            <span className="font-semibold">Enter Details</span>
          </div>
          <div className="h-0.5 flex-1 bg-white/10 mx-4">
            {chartData && <div className="h-full bg-gradient-to-r from-orange-500 to-green-500"></div>}
          </div>
          <div className={`flex items-center gap-2 ${chartData ? 'text-orange-400' : 'text-slate-500'}`}>
            <span className="text-2xl">2️⃣</span>
            <span className="font-semibold">View Chart</span>
          </div>
          <div className="h-0.5 flex-1 bg-white/10 mx-4"></div>
          <div className={`flex items-center gap-2 ${activeTab === 'divisional' && chartData ? 'text-orange-400' : 'text-slate-500'}`}>
            <span className="text-2xl">3️⃣</span>
            <span className="font-semibold">Explore More</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 rounded-t-lg px-6 py-3 font-semibold transition ${
            activeTab === 'form'
              ? 'bg-white text-purple-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span className="text-xl">📝</span>
          <span>Your Details</span>
        </button>
        <button
          onClick={() => setActiveTab('chart')}
          disabled={!chartData}
          className={`flex items-center gap-2 rounded-t-lg px-6 py-3 font-semibold transition disabled:opacity-50 ${
            activeTab === 'chart'
              ? 'bg-white text-purple-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span className="text-xl">🌟</span>
          <span>Your Chart</span>
        </button>
        <button
          onClick={() => setActiveTab('divisional')}
          disabled={!chartData}
          className={`flex items-center gap-2 rounded-t-lg px-6 py-3 font-semibold transition disabled:opacity-50 ${
            activeTab === 'divisional'
              ? 'bg-white text-purple-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Explore More</span>
        </button>
      </div>

      {/* Form Tab */}
      {activeTab === 'form' && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          {showHelp && (
            <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="flex items-center gap-2 font-semibold text-blue-200">
                <span className="text-xl">ℹ️</span>
                What You'll Need
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-300">
                <li>• Your <strong>exact birth date</strong> (day/month/year)</li>
                <li>• Your <strong>birth time</strong> (as accurate as possible - check birth certificate!)</li>
                <li>• Your <strong>birth city</strong> or coordinates</li>
              </ul>
            </div>
          )}

          <h2 className="mb-6 text-2xl font-bold text-white">Step 1: Enter Your Birth Information</h2>

          <div className="space-y-6">
            {/* Chart Name Field */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Chart Name (Optional)
              </label>
              <input
                type="text"
                value={birthData.chartName}
                onChange={(e) => setBirthData({ ...birthData, chartName: e.target.value })}
                placeholder="e.g., My Birth Chart, Sister's Kundli"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <p className="mt-1 text-xs text-slate-400">
                If left blank, we'll auto-generate a name like "Birth Chart - 15 Jan 2025"
              </p>
            </div>

            {/* Date & Time Picker Component */}
            <DateTimePicker
              value={birthData.dateTime}
              onChange={(isoDatetime) => setBirthData({ ...birthData, dateTime: isoDatetime })}
              showHelp={showHelp}
            />

            {/* Location Picker Component */}
            <LocationPicker
              value={{
                city: birthData.location,
                latitude: birthData.latitude,
                longitude: birthData.longitude,
                timezone: birthData.timezone,
              }}
              onChange={(location) => setBirthData({
                ...birthData,
                location: location.city,
                latitude: location.latitude,
                longitude: location.longitude,
                timezone: location.timezone,
              })}
            />

            {/* Error Display */}
            {error && (
              <div className="rounded-lg bg-red-500/20 p-4 text-red-200">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateBirthChart}
              disabled={loading || !birthData.dateTime}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔄</span>
                  Generating Your Chart...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  Generate My Birth Chart
                </span>
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              🔒 Your data is secure and cached for 24 hours to save resources
            </p>
          </div>
        </div>
      )}

      {/* Chart Tab - Enhanced */}
      {activeTab === 'chart' && chartData && (
        <div className="space-y-6">
          {/* Success Message */}
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <p className="flex items-center gap-2 font-semibold text-green-200">
              <span className="text-2xl">🎉</span>
              Your Birth Chart is Ready!
            </p>
            <p className="mt-1 text-sm text-green-300">
              Born on {new Date(birthData.dateTime).toLocaleDateString('en-IN', { dateStyle: 'long' })} at{' '}
              {new Date(birthData.dateTime).toLocaleTimeString('en-IN', { timeStyle: 'short' })} in {birthData.location}
            </p>
          </div>

          {/* What This Means - Beginner */}
          {showHelp && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="mb-2 flex items-center gap-2 font-semibold text-blue-200">
                <span className="text-xl">📘</span>
                Understanding Your Chart
              </p>
              <p className="text-sm text-blue-300">
                Your birth chart is like a cosmic snapshot of the sky at the moment you were born. It shows where the planets were positioned, which influences different aspects of your life and personality.
              </p>
            </div>
          )}

          {/* Ascendant - Enhanced */}
          {chartData.data.ascendant !== undefined && (
            <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-pink-500/20 p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm text-orange-200">
                    <span className="text-xl">🌅</span>
                    Your Rising Sign (Ascendant)
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {getSignName(Math.floor(chartData.data.ascendant / 30) + 1)} {formatDegree(chartData.data.ascendant % 30)}
                  </p>
                </div>
                {chartData.from_cache && (
                  <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                    🎯 FROM CACHE
                  </span>
                )}
              </div>
              {showHelp && (
                <div className="mt-4 rounded-lg bg-white/10 p-3 text-sm text-white">
                  <p className="font-semibold">What is the Ascendant?</p>
                  <p className="mt-1 text-slate-200">
                    This is how others see you and your approach to life. It&apos;s determined by the exact time and place of your birth.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Planetary Positions - Enhanced with tooltips */}
          {chartData.data.planets && chartData.data.planets.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-white">
                <span className="text-2xl">🪐</span>
                Your Planetary Positions
              </h3>
              {showHelp && (
                <p className="mb-4 text-sm text-slate-300">
                  Click on any planet to learn what it means for you
                </p>
              )}

              <div className="space-y-2">
                {chartData.data.planets.map((planet, idx) => {
                  const meaning = planetMeanings[planet.name]
                  const signInfo = signMeanings[planet.sign || '']
                  const isExpanded = expandedPlanet === planet.name

                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10"
                    >
                      <button
                        onClick={() => setExpandedPlanet(isExpanded ? null : planet.name)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{meaning?.icon}</span>
                            <div>
                              <p className="font-semibold text-white">{planet.name}</p>
                              {meaning && <p className="text-xs text-slate-400">{meaning.area}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-semibold ${signInfo?.color || 'text-white'}`}>
                                {planet.sign}
                              </p>
                              <p className="text-xs text-slate-400">{formatDegree(planet.normDegree)}</p>
                            </div>
                            {(planet.isRetro === true || planet.isRetro === 'true') && (
                              <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-300">
                                ℞ Retro
                              </span>
                            )}
                            <span className="text-white">{isExpanded ? '▼' : '▶'}</span>
                          </div>
                        </div>
                      </button>

                      {/* Expanded Info */}
                      {isExpanded && showHelp && meaning && (
                        <div className="border-t border-white/10 bg-white/5 p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-xs font-semibold text-purple-300">What {planet.name} represents:</p>
                              <p className="text-sm text-white">{meaning.meaning}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold text-purple-300">In {planet.sign} sign:</p>
                              <p className="text-sm text-white">
                                {signInfo ? `${signInfo.element} element - ${signInfo.nature}` : 'Influences your ' + meaning.area}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 text-xs font-semibold text-purple-300">House Position:</p>
                              <p className="text-sm text-white">House {planet.house || '?'}</p>
                            </div>
                            {(planet.isRetro === true || planet.isRetro === 'true') && (
                              <div>
                                <p className="mb-1 text-xs font-semibold text-red-300">Retrograde:</p>
                                <p className="text-sm text-white">Planet appears to move backward - internalized energy</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Houses Guide - Beginner Friendly */}
          {showHelp && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                <span className="text-2xl">🏠</span>
                Understanding the 12 Houses
              </h3>
              <p className="mb-4 text-sm text-slate-300">
                Each house represents a different area of your life. Hover over each house to learn more.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(houseMeanings).map(([houseNum, house]) => (
                  <div
                    key={houseNum}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:shadow-lg"
                    title={house.meaning}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-purple-300">{house.lifeArea}</p>
                        <p className="mt-1 font-semibold text-white">{house.name}</p>
                        <p className="mt-2 text-xs text-slate-300">{house.meaning}</p>
                      </div>
                      <span className="text-2xl opacity-50 group-hover:opacity-100 transition">{parseInt(houseNum) === 1 ? '👤' : parseInt(houseNum) === 7 ? '💑' : parseInt(houseNum) === 10 ? '💼' : '🏠'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart Visualization */}
          {svgData['D1'] && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="text-2xl">📈</span>
                  Visual Chart
                </h3>

                {/* Toolbar with Save, Download & Share Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSaveChart}
                    disabled={savingChart || !!savedChartId}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
                    title="Save to My Kundlis"
                  >
                    {savingChart ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Saving...
                      </>
                    ) : savedChartId ? (
                      <>
                        <span>✅</span>
                        Saved!
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        Save
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadPNG}
                    disabled={downloadingPNG}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
                    title="Download as PNG"
                  >
                    {downloadingPNG ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <span>📥</span>
                        PNG
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloadingPDF}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:opacity-50"
                    title="Download as PDF"
                  >
                    {downloadingPDF ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        PDF
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyShareLink}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
                    title="Copy Share Link"
                  >
                    {copiedLink ? (
                      <>
                        <span>✅</span>
                        Copied!
                      </>
                    ) : (
                      <>
                        <span>🔗</span>
                        Share
                      </>
                    )}
                  </button>
                </div>
              </div>

              {showHelp && (
                <p className="mb-4 text-sm text-slate-300">
                  This is a traditional South Indian style chart showing planetary positions in houses. Use the buttons above to download or share your chart.
                </p>
              )}

              <div
                id="rasi-chart"
                className="flex justify-center rounded-lg bg-white p-6"
                dangerouslySetInnerHTML={{ __html: svgData['D1'].data.svg_code }}
              />
            </div>
          )}

          {/* Next Steps */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <p className="mb-3 flex items-center gap-2 font-semibold text-white">
              <span className="text-xl">🎯</span>
              What's Next?
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>• Explore <strong>Divisional Charts</strong> to see specific areas like marriage, career, and wealth</p>
              <p>• Consult with an astrologer for personalized readings</p>
              <p>• Save this chart for future reference</p>
            </div>
            <button
              onClick={() => setActiveTab('divisional')}
              className="mt-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white transition hover:shadow-lg"
            >
              Explore Divisional Charts →
            </button>
          </div>
        </div>
      )}

      {/* Divisional Charts Tab - Enhanced */}
      {activeTab === 'divisional' && chartData && (
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="mb-2 flex items-center gap-2 font-semibold text-blue-200">
              <span className="text-2xl">🔍</span>
              Dive Deeper Into Your Life
            </p>
            <p className="text-sm text-blue-300">
              Divisional charts (Vargas) zoom into specific areas of your life for detailed analysis
            </p>
          </div>

          {/* Beginner vs Advanced */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Beginner-Friendly Charts */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                <span>⭐</span>
                Start With These
              </h3>
              <div className="space-y-2">
                {divisionalCharts.filter(c => c.beginner).map((chart) => (
                  <button
                    key={chart.code}
                    onClick={() => {
                      setSelectedDivisional(chart.code)
                      fetchSVG(chart.code)
                    }}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedDivisional === chart.code
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{chart.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{chart.name}</p>
                        <p className="text-xs text-slate-300">{chart.desc}</p>
                      </div>
                      {selectedDivisional === chart.code && <span className="text-orange-400">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Charts */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                <span>🎓</span>
                Advanced Charts
              </h3>
              <div className="space-y-2">
                {divisionalCharts.filter(c => !c.beginner).map((chart) => (
                  <button
                    key={chart.code}
                    onClick={() => {
                      setSelectedDivisional(chart.code)
                      fetchSVG(chart.code)
                    }}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      selectedDivisional === chart.code
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{chart.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{chart.name}</p>
                        <p className="text-xs text-slate-300">{chart.desc}</p>
                      </div>
                      {selectedDivisional === chart.code && <span className="text-purple-400">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Chart Display */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">
              {divisionalCharts.find(c => c.code === selectedDivisional)?.name || selectedDivisional}
            </h3>

            {svgData[selectedDivisional] ? (
              <div
                className="flex justify-center rounded-lg bg-white p-6"
                dangerouslySetInnerHTML={{ __html: svgData[selectedDivisional].data.svg_code }}
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <div className="text-center">
                  <div className="mb-2 animate-pulse text-4xl">📊</div>
                  <p>Loading {selectedDivisional} chart...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
