 "use client";

import Image from "next/image";
import { Card } from "@digital-astrology/ui";
import { getPanchangToday } from "@lib/api/panchang";
import { useQuery } from "@tanstack/react-query";

export default function PanchangHighlights() {
  const { data, isLoading } = useQuery({
    queryKey: ["panchang", "today"],
    queryFn: () => getPanchangToday({ locale: "hi" })
  });

  return (
    <section className="px-6 lg:px-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="gradient-title">दैनिक पंचांग • Daily Panchang</h2>
          <p className="mt-3 max-w-xl text-sm text-slate-300">
            Accurate sunrise timings, tithi and nakshatra fetched from Drik Panchang to plan your पूजा,
            यात्रा and जीवन निर्णय.
          </p>
        </div>
        <div className="relative h-28 w-full max-w-xs overflow-hidden rounded-3xl border border-white/10">
          <Image
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
            alt="Panchang calendar"
            fill
            className="object-cover opacity-70"
          />
        </div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card className="border-white/5 bg-white/10" title="Tithi" subtitle={data?.tithi ?? "--"}>
          <p className="text-sm text-slate-300">
            {isLoading ? "Loading Panchang details…" : "Auspicious timings aligned with चंद्र मास."}
          </p>
        </Card>
        <Card className="border-white/5 bg-white/10" title="Nakshatra" subtitle={data?.nakshatra ?? "--"}>
          <p className="text-sm text-slate-300">
            {isLoading ? "" : "Ideal for vastu, यात्रा, संस्कार as per today’s constellation."}
          </p>
        </Card>
        <Card
          className="border-white/5 bg-white/10"
          title="Sunrise • Sunset"
          subtitle={`${data?.sunrise ?? "--"} / ${data?.sunset ?? "--"}`}
        >
          <p className="text-sm text-slate-300">
            {isLoading ? "" : "Plan पूजा & संध्या आरती with Surya dev’s precise timings."}
          </p>
        </Card>
      </div>
    </section>
  );
}
