import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Consult Trusted Astrologers | Jyotishya"
};

export default function ConsultationsPage() {
  return (
    <main className="px-6 pb-24 pt-16 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white">Consult Trusted Astrologers</h1>
          <p className="mt-4 text-lg text-slate-300">
            Connect with verified experts across Vedic, KP, Tarot, Numerology, Vastu, and more
          </p>
        </header>

        {/* Coming Soon Banner */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mb-6 text-6xl">🔮</div>
          <h2 className="mb-4 text-2xl font-semibold text-white">Coming Soon</h2>
          <p className="mb-8 text-slate-300">
            We&apos;re building a marketplace of verified astrologers. Soon you&apos;ll be able to:
          </p>
          <ul className="mb-8 space-y-2 text-left text-slate-300">
            <li className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              <span>Browse verified astrologers by specialty and language</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              <span>Book video consultations at your convenience</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              <span>Read reviews and ratings from other users</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              <span>Get instant chat support for quick questions</span>
            </li>
          </ul>
          <Link
            href="/"
            className="inline-flex rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
