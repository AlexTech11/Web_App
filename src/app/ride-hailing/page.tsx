import type { Metadata } from "next";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Ride-Hailing Registration – Bolt, Uber & inDrive",
  description:
    "Register your car for Bolt, Uber or inDrive in Nigeria. Document verification, vehicle inspection and onboarding support from AfroSamboza.",
};

const platforms = [
  {
    id: "bolt",
    logoClass: "bolt-logo",
    logo: "⚡",
    name: "Bolt",
    desc: "Register your vehicle on Bolt's growing network across Nigerian cities. Quick onboarding, competitive fares.",
    features: [
      "Document verification support",
      "Vehicle inspection coordination",
      "App setup & training",
      "Ongoing driver support",
    ],
    portal: {
      href: "https://partners.bolt.eu?refid=ALEXU80",
      label: "⚡ Open Bolt Partner Portal →",
    },
  },
  {
    id: "uber",
    logoClass: "uber-logo",
    logo: "U",
    name: "Uber",
    desc: "Join Uber's global platform. Trusted by millions, with strong earnings potential across Abuja and Lagos.",
    features: [
      "Full documentation guidance",
      "Background check support",
      "Earnings optimisation tips",
      "Driver community access",
    ],
    portal: {
      href: "https://drivers.uber.com/i/f6gu238",
      label: "🚗 Open Uber Driver Portal →",
    },
  },
  {
    id: "indrive",
    logoClass: "indrive-logo",
    logo: "iD",
    name: "inDrive",
    desc: "inDrive lets drivers and passengers negotiate fares directly. More control, more earnings flexibility.",
    features: [
      "Fare negotiation model",
      "Minimal commission rates",
      "Fast approval process",
      "Multiple service categories",
    ],
    portal: { href: "#regForm", label: "🟢 Fill Registration Form →" },
  },
];

export default function RideHailingPage() {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Ride-Hailing Registration</div>
        <h2 className="section-title">Register for Bolt, Uber &amp; inDrive</h2>
        <p className="section-sub">
          Choose your platform and get your car on the road earning today
        </p>
      </div>

      <div className="platform-cards">
        {platforms.map((p) => (
          <div key={p.id} className="platform-card">
            <div className={`platform-logo ${p.logoClass}`}>{p.logo}</div>
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
            <div className="platform-features">
              {p.features.map((f) => (
                <div key={f} className="platform-feature">
                  <span>✓</span> {f}
                </div>
              ))}
            </div>
            <a
              href="#regForm"
              className="btn btn-primary"
              style={{ width: "100%", marginBottom: 10 }}
            >
              Register for {p.name}
            </a>
            <a
              href={p.portal.href}
              target={p.portal.href.startsWith("http") ? "_blank" : undefined}
              rel={p.portal.href.startsWith("http") ? "noopener" : undefined}
              className="btn btn-outline"
              style={{ width: "100%", justifyContent: "center", fontSize: 13 }}
            >
              {p.portal.label}
            </a>
          </div>
        ))}
      </div>

      <RegistrationForm />
    </div>
  );
}
