import { Card } from "@digital-astrology/ui";

const FEATURES = [
  {
    title: "Authentic Jyotish",
    description: "Powered by Vedic panchang, NASA ephemeris and experienced Acharyas across India.",
    icon: "🪔"
  },
  {
    title: "Regional Languages",
    description: "Horoscope, Kundli, and remedies available in Hindi & English with support for more Bharatiya languages coming soon.",
    icon: "🗣️"
  },
  {
    title: "Secure Consultations",
    description: "End-to-end encrypted chat, voice, video and wallet with instant UPI settlements & loyalty coins.",
    icon: "🔐"
  },
  {
    title: "Temple-Energised Store",
    description: "Certified gemstones, yantras, and puja kits energised by partner temples and Gurukuls.",
    icon: "🕉️"
  }
];

export default function FeaturesSection() {
  return (
    <section className="px-6 lg:px-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Why Jyotishya</p>
        <h2 className="mt-4 gradient-title">Crafted for the spiritual seeker in India</h2>
        <p className="mt-3 text-sm text-slate-300">
          Blend of ancient jyotish wisdom, modern astronomy, and trusted gurus to support every life
          decision.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="relative overflow-hidden border-white/5 bg-gradient-to-br from-white/5 to-white/10">
            <div className="absolute right-6 top-6 text-4xl opacity-70">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
