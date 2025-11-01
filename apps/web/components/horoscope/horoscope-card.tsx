"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Button } from "@digital-astrology/ui";
import type { HoroscopeEntry, LocaleCode, SunSign } from "@digital-astrology/lib";
import { getDailyInterpretation } from "@lib/api/horoscope";

interface Props {
  sign: string;
  sunSign: SunSign;
  locale: LocaleCode;
  data?: HoroscopeEntry;
  loading?: boolean;
}

export default function HoroscopeCard({ sign, sunSign, locale, data, loading }: Props) {
  const [showInterpretation, setShowInterpretation] = useState(false);

  const {
    data: interpretation,
    refetch,
    isFetching,
    isFetched,
    status
  } = useQuery({
    queryKey: ["horoscope", "interpretation", sunSign, locale],
    queryFn: () =>
      getDailyInterpretation({
        sunSign,
        locale,
        tone: "uplifting",
        focus: "career"
      }),
    enabled: false,
    staleTime: 1000 * 60 * 60 // cache for an hour per sign/locale combo
  });

  const handleToggleInterpretation = async () => {
    if (!isFetched) {
      const result = await refetch();
      if (result.error) {
        return;
      }
    }

    setShowInterpretation((prev) => !prev);
  };

  const interpretationError = status === "error";

  return (
    <Card
      className="border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-white/0"
      title={sign}
      subtitle={data?.mood ?? "Balanced"}
    >
      {loading ? (
        <p className="animate-pulse text-sm text-slate-400">Loading personalised guidance…</p>
      ) : (
        <>
          <p className="text-sm leading-6 text-slate-200">
            {data?.summary ?? "Coming soon. Personalised insights will appear here."}
          </p>
          <footer className="mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Lucky Number: {data?.luckyNumber ?? "--"}</span>
            <span>Lucky Color: {data?.luckyColor ?? "--"}</span>
          </footer>
        </>
      )}

      <div className="mt-6 space-y-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleToggleInterpretation}
          disabled={loading || isFetching}
        >
          {isFetching ? "Asking our astrologer..." : showInterpretation ? "Hide AI insight" : "View AI insight"}
        </Button>
        {interpretationError && (
          <p className="text-xs text-red-300">
            Could not load interpretation. Please try again in a moment.
          </p>
        )}
        {showInterpretation && interpretation && (
          <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-slate-200">
            <p className="leading-6 whitespace-pre-line">{interpretation.interpretation.narrative}</p>
            <p className="mt-3 text-xs text-slate-500">
              Source: {interpretation.interpretation.provider === "openai" ? "OpenAI" : "Mock"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
