import type { Metadata } from "next";
import Link from "next/link";
import LeadershipPhoto from "@/components/LeadershipPhoto";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "AfroSamboza is Abuja's trusted platform for ride-hailing car registration, vehicle sales & rentals, and property listings across Nigeria.",
};

const values = [
  {
    icon: "🤝",
    title: "Trust First",
    desc: "Every driver, vehicle and property is verified by our team before it goes live.",
  },
  {
    icon: "⚡",
    title: "Fast & Simple",
    desc: "From registration to approval in 24–48 hours, with real people guiding you.",
  },
  {
    icon: "🇳🇬",
    title: "Built for Nigeria",
    desc: "Local knowledge, local support, local prices — designed for Abuja and beyond.",
  },
];

export default function AboutPage() {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">About Us</div>
        <h2 className="section-title">One Platform for Cars, Rides &amp; Property</h2>
        <p className="section-sub">
          Helping Nigerians earn, move and invest — all in one trusted place.
        </p>
      </div>

      <div className="prose">
        <p>
          AfroSamboza started with a simple idea: getting your car onto Bolt,
          Uber or inDrive — or buying, selling and renting cars and property in
          Nigeria — should be straightforward, transparent and safe. Too often
          it isn&apos;t.
        </p>
        <p>
          Based in Area 11, Abuja, we bring ride-hailing registration, a
          verified vehicle marketplace, and property listings together under one
          roof. Our team handles the paperwork, verification and inspections so
          you can focus on earning and growing.
        </p>
      </div>

      <div className="services-grid" style={{ marginTop: 40 }}>
        {values.map((v) => (
          <div className="service-card" key={v.title}>
            <div className="card-icon">{v.icon}</div>
            <div className="card-title">{v.title}</div>
            <div className="card-desc">{v.desc}</div>
          </div>
        ))}
      </div>

      <div className="hero-stats" style={{ marginTop: 60 }}>
        <div className="stat"><div className="stat-num">500+</div><div className="stat-label">Cars Registered</div></div>
        <div className="stat"><div className="stat-num">1,200+</div><div className="stat-label">Active Listings</div></div>
        <div className="stat"><div className="stat-num">3</div><div className="stat-label">Ride Platforms</div></div>
        <div className="stat"><div className="stat-num">98%</div><div className="stat-label">Satisfaction Rate</div></div>
      </div>

      <div id="leadership" className="section-header" style={{ marginTop: 80, scrollMarginTop: 80 }}>
        <div className="section-label">Leadership</div>
        <h2 className="section-title">Meet the Team</h2>
      </div>
      <div className="form-container" style={{ textAlign: "center" }}>
        <LeadershipPhoto />
        <div className="card-title" style={{ fontSize: 20 }}>Alex Ukpong</div>
        <div className="card-desc">Founder &amp; Chief Executive Officer</div>
        <p className="section-sub" style={{ maxWidth: 520, margin: "16px auto 0" }}>
          Driving AfroSamboza&apos;s mission to make mobility and property
          accessible, transparent and rewarding for every Nigerian.
        </p>
      </div>

      <div className="hero-ctas" style={{ marginTop: 50 }}>
        <Link href="/ride-hailing" className="btn btn-gold">🚗 Register Your Car</Link>
        <Link href="/contact" className="btn btn-outline">Contact Us →</Link>
      </div>
    </div>
  );
}
