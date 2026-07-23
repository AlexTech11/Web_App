import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "AfroSamboza user and admin dashboard.",
};

export default function DashboardPage() {
  return (
    <div className="section" style={{ textAlign: "center" }}>
      <div className="section-header">
        <div className="section-label">Coming Soon</div>
        <h2 className="section-title">Dashboard Launching in Phase 2</h2>
        <p className="section-sub">
          Account login, registration tracking, listing management and admin
          tools are on the way. In the meantime, submissions are received and
          processed by our team.
        </p>
      </div>
      <div className="hero-ctas">
        <Link href="/ride-hailing" className="btn btn-gold">
          🚗 Register Your Car
        </Link>
        <Link href="/sell" className="btn btn-outline">
          List an Asset →
        </Link>
      </div>
    </div>
  );
}
