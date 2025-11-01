import { Metadata } from "next";
import DashboardOverview from "@components/sections/dashboard-overview";

export const metadata: Metadata = {
  title: "Your Cosmic Dashboard | Jyotishya"
};

export default function DashboardPage() {
  return (
    <main className="space-y-12 px-6 pb-24 pt-16 lg:px-16">
      <DashboardOverview />
    </main>
  );
}
