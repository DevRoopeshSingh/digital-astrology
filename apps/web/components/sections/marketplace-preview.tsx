"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Button } from "@digital-astrology/ui";
import Link from "next/link";
import { getFeaturedProducts } from "@lib/api/products";

export default function MarketplacePreview() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getFeaturedProducts(3)
  });

  const products = useMemo(() => data ?? [], [data]);

  return (
    <section className="px-6 lg:px-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="gradient-title">Sacred Storefront</h2>
          <p className="mt-2 text-sm text-slate-300">
            Energised gemstones, yantras, books, and puja essentials curated by experts.
          </p>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/shop">View Marketplace →</Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse border-white/5 bg-white/5">
              <div className="mb-4 h-36 rounded-2xl bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
              <div className="mt-3 h-3 w-3/4 rounded bg-white/10" />
            </Card>
          ))}
        {!isLoading &&
          products.map((product) => (
            <Card
              key={product.sku}
              title={product.name}
              subtitle={`${product.category} • ₹${product.price.toLocaleString("en-IN")}`}
            >
              <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-slate-200">{product.certification}</p>
            </Card>
          ))}
      </div>
    </section>
  );
}
