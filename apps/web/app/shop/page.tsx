import { Metadata } from "next";
import MarketplaceGrid from "@components/sections/marketplace-grid";

export const metadata: Metadata = {
  title: "Astro Marketplace | Jyotishya"
};

export default function ShopPage() {
  return (
    <main className="space-y-12 px-6 pb-24 pt-16 lg:px-16">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold text-white">Shop Gems, Yantras & Puja Kits</h1>
        <p className="mt-4 text-sm text-slate-300">
          CRS-certified gemstones, temple-sanctified yantras, curated books, and ready puja kits.
        </p>
      </header>
      <MarketplaceGrid />
    </main>
  );
}
