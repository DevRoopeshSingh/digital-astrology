'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DateTimePicker from '@/components/astrology/datetime-picker'
import LocationPicker from '@/components/astrology/location-picker'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: 'Delhi, India',
    birthLatitude: 28.6139,
    birthLongitude: 77.2090,
    birthTimezone: 5.5,
    preferredSystem: 'VEDIC' as 'VEDIC' | 'WESTERN',
  })

  const handleDateTimeChange = (dateTime: string) => {
    const [date, time] = dateTime.split('T')
    setFormData(prev => ({ ...prev, birthDate: date, birthTime: time }))
  }

  const handleLocationChange = (location: {
    city: string
    latitude: number
    longitude: number
    timezone: number
  }) => {
    setFormData(prev => ({
      ...prev,
      birthPlace: location.city,
      birthLatitude: location.latitude,
      birthLongitude: location.longitude,
      birthTimezone: location.timezone,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate
      if (!formData.name || !formData.birthDate || !formData.birthTime || !formData.birthPlace) {
        throw new Error('Please fill in all required fields')
      }

      const birthDateTime = `${formData.birthDate}T${formData.birthTime}`
      const birthDateObj = new Date(birthDateTime)

      if (isNaN(birthDateObj.getTime())) {
        throw new Error('Invalid birth date or time')
      }

      if (birthDateObj > new Date()) {
        throw new Error('Birth date cannot be in the future')
      }

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save your astrological profile')
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isValid = formData.name && formData.birthDate && formData.birthTime && formData.birthPlace

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cosmic-blue via-purple-900 to-cosmic-blue p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            ✨ Create Your Astro Profile
          </h1>
          <p className="text-slate-300">
            Tell us about your birth details to unlock personalized insights
          </p>
        </div>

        {/* Single Form Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Birth Date & Time */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Birth Date & Time <span className="text-red-400">*</span>
              </label>
              <DateTimePicker
                value={formData.birthDate && formData.birthTime ? `${formData.birthDate}T${formData.birthTime}` : ''}
                onChange={handleDateTimeChange}
              />
              <p className="mt-2 text-xs text-slate-400">
                💡 Accurate birth time is crucial for chart calculations
              </p>
            </div>

            {/* Birth Place */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Birth Place <span className="text-red-400">*</span>
              </label>
              <LocationPicker
                value={{
                  city: formData.birthPlace,
                  latitude: formData.birthLatitude,
                  longitude: formData.birthLongitude,
                  timezone: formData.birthTimezone,
                }}
                onChange={handleLocationChange}
              />
              <p className="mt-2 text-xs text-slate-400">
                🌍 We'll automatically detect timezone and coordinates
              </p>
            </div>

            {/* Astrology System */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-3">
                Preferred Astrology System <span className="text-red-400">*</span>
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, preferredSystem: 'VEDIC' }))}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    formData.preferredSystem === 'VEDIC'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="mb-2 text-2xl">🕉️</div>
                  <h3 className="mb-1 text-lg font-semibold text-white">Vedic</h3>
                  <p className="text-xs text-slate-300">
                    Traditional Indian astrology (Jyotish)
                  </p>
                  {formData.preferredSystem === 'VEDIC' && (
                    <div className="mt-2 text-xs font-semibold text-orange-400">✓ Selected</div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, preferredSystem: 'WESTERN' }))}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    formData.preferredSystem === 'WESTERN'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="mb-2 text-2xl">⭐</div>
                  <h3 className="mb-1 text-lg font-semibold text-white">Western</h3>
                  <p className="text-xs text-slate-300">
                    Modern psychological astrology
                  </p>
                  {formData.preferredSystem === 'WESTERN' && (
                    <div className="mt-2 text-xs font-semibold text-orange-400">✓ Selected</div>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Your Profile...' : 'Complete Setup 🎉'}
            </button>

            <p className="text-center text-xs text-slate-400">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-orange-400 hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-orange-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>

        {/* Why We Need This */}
        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="mb-2 text-sm font-semibold text-white">Why we need these details:</h3>
          <ul className="space-y-1 text-xs text-slate-300">
            <li>🌞 <strong>Sun Sign:</strong> Your core personality and life purpose</li>
            <li>🌙 <strong>Moon Sign:</strong> Your emotional nature and inner self</li>
            <li>⬆️ <strong>Rising Sign:</strong> How others see you and your life path</li>
            <li>📅 <strong>Daily Horoscope:</strong> Personalized guidance based on your chart</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
