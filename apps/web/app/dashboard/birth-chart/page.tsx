import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BirthChartGeneratorV2 from '@components/astrology/birth-chart-generator-v2'

export const metadata = {
  title: 'Birth Chart | Jyotishya',
  description: 'Generate your Vedic birth chart (Kundli) with planetary positions',
}

export default async function BirthChartPage() {
  // Server-side authentication check
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/signin?callbackUrl=/dashboard/birth-chart')
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">
          🌟 Your Birth Chart (Kundli)
        </h1>
        <p className="text-slate-300">
          Generate your Vedic astrology birth chart with detailed planetary positions
        </p>
      </div>

      {/* Birth Chart Generator Component */}
      <BirthChartGeneratorV2 userId={user.id} userEmail={user.email || ''} />

      {/* Info Section - Enhanced for Beginners */}
      <div className="mt-12 space-y-6">
        {/* Main About Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-xl font-semibold text-white">
            📚 About Your Birth Chart
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-orange-300">
                <span className="text-xl">🌟</span>
                What is a Birth Chart?
              </h4>
              <p className="mb-3 text-sm text-slate-300">
                A birth chart (Kundli in Hindi, Janam Patrika in Sanskrit) is like a cosmic photograph of the sky at the exact moment and place you were born.
              </p>
              <p className="text-sm text-slate-300">
                It captures the positions of all 9 planets (Navagraha), 12 zodiac signs (Rashis), and 12 houses (Bhavas).
                This unique cosmic map reveals your personality, strengths, challenges, and life path according to Vedic astrology principles that have been practiced for thousands of years in India.
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-purple-300">
                <span className="text-xl">🌙</span>
                Your Rising Sign (Ascendant)
              </h4>
              <p className="mb-3 text-sm text-slate-300">
                Your ascendant (Lagna) is the zodiac sign that was rising on the eastern horizon at the moment of your birth.
              </p>
              <p className="text-sm text-slate-300">
                This is considered the most important part of your chart in Vedic astrology! It determines your physical appearance,
                personality, and how you approach life. It also sets the foundation for all 12 houses in your chart, making accurate birth time essential.
              </p>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-300">
                <span className="text-xl">📊</span>
                Divisional Charts (Vargas)
              </h4>
              <p className="mb-2 text-sm text-slate-300">
                Vedic astrology uses divisional charts to zoom into specific areas of life:
              </p>
              <ul className="space-y-1 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>D1 (Rasi Chart):</strong> Your main birth chart - shows overall life journey</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>D9 (Navamsa):</strong> Marriage, spouse qualities, spiritual strength</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>D10 (Dasamsa):</strong> Career path, profession, reputation</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-300">
                <span className="text-xl">⏰</span>
                Why Birth Time Matters
              </h4>
              <p className="mb-3 text-sm text-slate-300">
                <strong>Accuracy is everything!</strong> Your ascendant (Lagna) changes approximately every 2 hours, and even a difference of 4-5 minutes can shift house placements.
              </p>
              <p className="text-sm text-slate-300">
                💡 <strong>Pro tip:</strong> Always check your birth certificate or hospital records for the most accurate time.
                If you don&apos;t know your exact birth time, consult a Vedic astrologer who can perform "birth time rectification" using major life events.
              </p>
            </div>
          </div>
        </div>

        {/* Understanding Planets Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-xl font-semibold text-white">
            🪐 The 9 Planets (Navagraha)
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">☀️ Sun (Surya)</p>
              <p className="text-xs text-slate-300">Soul, father, authority, government, vitality</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">🌙 Moon (Chandra)</p>
              <p className="text-xs text-slate-300">Mind, mother, emotions, mental peace</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">🔥 Mars (Mangal)</p>
              <p className="text-xs text-slate-300">Energy, courage, siblings, property, sports</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">💬 Mercury (Budh)</p>
              <p className="text-xs text-slate-300">Intelligence, speech, business, communication</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">🎓 Jupiter (Guru)</p>
              <p className="text-xs text-slate-300">Wisdom, children, teacher, fortune, spirituality</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">💝 Venus (Shukra)</p>
              <p className="text-xs text-slate-300">Love, marriage, luxury, arts, beauty</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">⏱️ Saturn (Shani)</p>
              <p className="text-xs text-slate-300">Karma, discipline, delays, longevity, hard work</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">🌑 Rahu (North Node)</p>
              <p className="text-xs text-slate-300">Material desires, foreign lands, technology</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-1 font-semibold text-white">🌑 Ketu (South Node)</p>
              <p className="text-xs text-slate-300">Spirituality, detachment, past life karma</p>
            </div>
          </div>
        </div>

        {/* Privacy & Technical Info */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-green-300">
            <span className="text-xl">🔒</span>
            Your Privacy & Data Security
          </h3>
          <div className="space-y-2 text-sm text-green-200">
            <p>✓ Your birth details are cached securely for 24 hours to optimize API usage</p>
            <p>✓ No personal data is shared with third parties</p>
            <p>✓ You can download your chart anytime and delete your account whenever you wish</p>
            <p>✓ All calculations are performed using authentic Vedic astrology algorithms (Lahiri Ayanamsa)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
