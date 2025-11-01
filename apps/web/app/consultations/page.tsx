import { Metadata } from "next";
import AstrologerDirectory from "@components/consultation/directory";

export const metadata: Metadata = {
  title: "Consult Trusted Astrologers | Jyotishya"
};

export default function ConsultationsPage() {
  return (
    <main className="px-6 pb-24 pt-16 lg:px-16">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-white">Consult Trusted Astrologers</h1>
        <p className="mt-4 text-sm text-slate-300">
          Browse verified experts across Vedic, KP, Tarot, Numerology, Vastu, and more. Filter by
          language, experience, and rating before booking a session.
        </p>
      </header>
      <AstrologerDirectory />
    </main>
  );
}
