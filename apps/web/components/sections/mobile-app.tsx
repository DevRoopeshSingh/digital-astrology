import Image from "next/image";
import { Button } from "@digital-astrology/ui";

export default function MobileAppSection() {
  return (
    <section className="px-6 lg:px-16">
      <div className="grid items-center gap-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#1a1036] via-[#25174c] to-[#301d5e] px-8 py-12 shadow-astro lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-white">Carry Jyotishya in your pocket</h2>
          <p className="mt-3 text-sm text-slate-200">
            Daily notifications for your rashi, personalised dosha remedies, and instant chat with
            astrologers. Trusted Indian payment gateways and bilingual support built-in.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button size="sm">Download for Android</Button>
            <Button size="sm" variant="secondary">
              Coming Soon on iOS
            </Button>
          </div>
        </div>
        <div className="relative mx-auto h-72 w-40">
          <Image
            src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80"
            alt="Astrology mobile app preview"
            fill
            className="rounded-[32px] border-4 border-white/20 object-cover"
          />
        </div>
      </div>
    </section>
  );
}
