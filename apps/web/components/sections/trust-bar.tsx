const STATS = [
  { label: "Astrologers", value: "150+" },
  { label: "Cities Served", value: "400" },
  { label: "Auspicious Muhurat Alerts", value: "2M" },
  { label: "Gemstones Certified", value: "10K" }
];

export default function TrustBar() {
  return (
    <section className="relative z-10 px-6 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 px-8 py-6 text-center text-sm text-slate-200 backdrop-blur-xl">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex-1 min-w-[120px]">
            <p className="text-2xl font-semibold text-orange-200">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
