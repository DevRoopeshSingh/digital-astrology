"use client";

import clsx from "clsx";
import { useLocaleContext } from "@components/providers/intl-provider";

const OPTIONS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिं" },
  { code: "ta", label: "தமிழ்" }
] as const;

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleContext();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs text-slate-200">
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLocale(option.code)}
          className={clsx(
            "rounded-full px-3 py-1 transition",
            locale === option.code
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
              : "hover:text-white"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
