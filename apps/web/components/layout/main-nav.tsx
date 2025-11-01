"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@digital-astrology/ui";
import clsx from "clsx";
import LocaleSwitcher from "@components/layout/locale-switcher";
import { useLocaleContext } from "@components/providers/intl-provider";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/consultations", key: "consult" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/shop", key: "shop" }
] as const;

export default function MainNav() {
  const pathname = usePathname();
  const { copy } = useLocaleContext();
  const { nav } = copy;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderLinks = (onClick?: () => void) => (
    <nav className="flex flex-col gap-3 text-sm text-slate-200 md:flex-row md:items-center">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={clsx(
            "rounded-full px-4 py-2 transition",
            pathname === link.href
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          )}
        >
          {nav.links[link.key as keyof typeof nav.links]}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#040713]/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-16">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-orange-200">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-lg text-white shadow-astro">
            ज्यो
          </span>
          <span>Jyotishya</span>
        </Link>
        <div className="hidden md:flex md:items-center md:gap-5">
          {renderLinks()}
          <LocaleSwitcher />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/auth/login">{nav.actions.signIn}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/consultations">{nav.actions.book}</Link>
          </Button>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className="flex h-4 flex-col justify-between">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </span>
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-4 border-t border-white/5 bg-[#050816]/95 px-6 py-6">
            {renderLinks(() => setMobileMenuOpen(false))}
            <LocaleSwitcher />
            <div className="flex flex-col gap-3">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  {nav.actions.signIn}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/consultations" onClick={() => setMobileMenuOpen(false)}>
                  {nav.actions.book}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
