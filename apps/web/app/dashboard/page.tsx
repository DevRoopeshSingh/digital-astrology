import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DailyHoroscopeGrid from '@components/horoscope/daily-grid'
import PanchangHighlights from '@components/sections/panchang-highlights'

export default async function DashboardPage() {
  // Server-side authentication check
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'there'

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white">Welcome back, {displayName}!</h1>
        <p className="mt-2 text-slate-300">{user.email}</p>
      </div>

      {/* Daily Horoscope */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-white">Your Daily Horoscope</h2>
        <DailyHoroscopeGrid />
      </div>

      {/* Panchang */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold text-white">Today&apos;s Panchang</h2>
        <PanchangHighlights />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-6 text-2xl font-semibold text-white">Explore More</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Your Birth Chart"
            description="Generate your Vedic Kundli with planetary positions"
            href="/dashboard/birth-chart"
            gradient="from-yellow-500 to-orange-500"
            icon="🌟"
          />
          <ActionCard
            title="View All Horoscopes"
            description="Explore daily, weekly, and monthly predictions"
            href="/#daily-horoscope"
            gradient="from-orange-500 to-pink-500"
          />
          <ActionCard
            title="Consult Astrologers"
            description="Connect with expert astrologers"
            href="/consultations"
            gradient="from-purple-500 to-indigo-500"
          />
          <ActionCard
            title="Explore Products"
            description="Browse spiritual items and remedies"
            href="/shop"
            gradient="from-green-500 to-teal-500"
          />
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
  href,
  gradient,
  icon
}: {
  title: string
  description: string
  href: string
  gradient: string
  icon?: string
}) {
  return (
    <Link href={href} className="group">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-2xl`}>
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  )
}
