import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MainNav from "@components/layout/main-nav";
import Footer from "@components/layout/footer";
import { IntlProvider } from "@components/providers/intl-provider";
import { QueryProvider } from "@components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jyotishya | Your Cosmic Companion",
  description: "Personalized Vedic & Western astrology services for India.",
  keywords: [
    "vedic astrology",
    "kundli",
    "panchang",
    "horoscope",
    "astrologer consultation"
  ],
  alternates: {
    canonical: "https://www.jyotishya.in"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-cosmic-blue text-slate-100`}>
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(244,200,93,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(255,99,132,0.1),_transparent_60%)]" />
          <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 mix-blend-screen" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=60')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <IntlProvider>
            <QueryProvider>
              <MainNav />
              {children}
              <Footer />
            </QueryProvider>
          </IntlProvider>
        </div>
      </body>
    </html>
  );
}
