"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import HoroscopeCard from "@components/horoscope/horoscope-card";
import { getDailyHoroscope } from "@lib/api/horoscope";
import type { LocaleCode, SunSign } from "@digital-astrology/lib";

const SIGN_MAP: Array<{
  sunSign: SunSign;
  western: string;
  vedic: string;
}> = [
  { sunSign: "aries", western: "Aries", vedic: "Mesha" },
  { sunSign: "taurus", western: "Taurus", vedic: "Vrishabha" },
  { sunSign: "gemini", western: "Gemini", vedic: "Mithuna" },
  { sunSign: "cancer", western: "Cancer", vedic: "Karka" },
  { sunSign: "leo", western: "Leo", vedic: "Simha" },
  { sunSign: "virgo", western: "Virgo", vedic: "Kanya" },
  { sunSign: "libra", western: "Libra", vedic: "Tula" },
  { sunSign: "scorpio", western: "Scorpio", vedic: "Vrishchika" },
  { sunSign: "sagittarius", western: "Sagittarius", vedic: "Dhanu" },
  { sunSign: "capricorn", western: "Capricorn", vedic: "Makara" },
  { sunSign: "aquarius", western: "Aquarius", vedic: "Kumbha" },
  { sunSign: "pisces", western: "Pisces", vedic: "Meena" }
];

type SystemType = "vedic" | "western";

export default function DailyHoroscopeGrid() {
  const [system, setSystem] = useState<SystemType>("vedic");

  const locale: LocaleCode = system === "vedic" ? "hi" : "en";

  const { data, isLoading } = useQuery({
    queryKey: ["horoscope", "daily", system],
    queryFn: () => getDailyHoroscope({ system, locale })
  });

  const signs = SIGN_MAP.map((sign) => ({
    ...sign,
    label: system === "vedic" ? sign.vedic : sign.western,
    dataKey: sign.western
  }));

  return (
    <section className="px-6 lg:px-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="gradient-title">आज का राशिफल • Daily Horoscope</h2>
          <p className="mt-3 max-w-xl text-sm text-slate-300">
            Sunrise updates aligned with Drik Panchang for Vedic राशियां & Western star signs. Lucky
            colours, numbers and moods crafted by our astro intelligence.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs text-slate-200">
          <button
            className={`rounded-full px-4 py-2 transition ${system === "vedic" ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "hover:text-white"}`}
            onClick={() => setSystem("vedic")}
          >
            Vedic (हिंदी)
          </button>
          <button
            className={`rounded-full px-4 py-2 transition ${system === "western" ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white" : "hover:text-white"}`}
            onClick={() => setSystem("western")}
          >
            Western (EN)
          </button>
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {signs.map((sign) => (
          <HoroscopeCard
            key={sign.label}
            sign={sign.label}
            sunSign={sign.sunSign}
            data={data?.[sign.dataKey]}
            loading={isLoading}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
