import Link from "next/link";
import ShareExperience from "@/components/ShareExperience";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface Review {
  id: string;
  name: string;
  location: string | null;
  service: string | null;
  rating: number;
  message: string;
}

async function getReviews(): Promise<Review[]> {
  try {
    const { data } = await getSupabase()
      .from("reviews")
      .select("id, name, location, service, rating, message")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(9);
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

const services = [
  {
    accent: "",
    icon: "🚕",
    title: "Car Registration – Bolt",
    desc: "Seamlessly register your vehicle on Bolt's platform with expert guidance and documentation support.",
    href: "/ride-hailing",
    link: "Get Started →",
  },
  {
    accent: "blue",
    icon: "🚙",
    title: "Car Registration – Uber",
    desc: "Fast-track your Uber registration. We handle all verification, inspections, and onboarding requirements.",
    href: "/ride-hailing",
    link: "Get Started →",
  },
  {
    accent: "green",
    icon: "🚘",
    title: "Car Registration – inDrive",
    desc: "Join the inDrive network. Flexible earnings, transparent pricing — we get you started quickly.",
    href: "/ride-hailing",
    link: "Get Started →",
  },
  {
    accent: "purple",
    icon: "🏷️",
    title: "Cars for Sale",
    desc: "Browse hundreds of verified cars listed for sale by trusted sellers across Nigeria.",
    href: "/listings?tab=cars-sale",
    link: "Browse →",
  },
  {
    accent: "red",
    icon: "🔑",
    title: "Car Rentals",
    desc: "Short or long-term vehicle rentals at competitive rates. Daily, weekly or monthly options available.",
    href: "/listings?tab=cars-rent",
    link: "View Rentals →",
  },
  {
    accent: "teal",
    icon: "🏠",
    title: "Properties & Land",
    desc: "Houses, apartments, commercial spaces and landed properties — buy, sell or rent with confidence.",
    href: "/listings?tab=properties",
    link: "Explore →",
  },
];

export default async function HomePage() {
  const reviews = await getReviews();
  return (
    <>
      <section id="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            Nigeria&apos;s Premier Auto &amp; Property Platform
          </div>
          <h1 className="hero-title">
            Drive Smarter.
            <br />
            List Better.
            <br />
            <em>Grow Faster.</em>
          </h1>
          <p className="hero-sub">
            Register your car for Bolt, Uber &amp; inDrive. Buy, sell, or rent
            cars and properties — all in one trusted platform based in Abuja,
            Nigeria.
          </p>
          <div className="hero-ctas">
            <Link href="/ride-hailing" className="btn btn-gold">
              🚗 Register Your Car
            </Link>
            <Link href="/listings" className="btn btn-outline">
              Browse Listings →
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">500+</div>
            <div className="stat-label">Cars Registered</div>
          </div>
          <div className="stat">
            <div className="stat-num">1,200+</div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="stat">
            <div className="stat-num">3</div>
            <div className="stat-label">Ride Platforms</div>
          </div>
          <div className="stat">
            <div className="stat-num">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </section>
      <hr className="section-divider" />

      <div className="section">
        <div className="section-header">
          <div className="section-label">Our Services</div>
          <h2 className="section-title">Everything You Need in One Place</h2>
          <p className="section-sub">
            From ride-hailing registration to buying and renting, we&apos;ve got
            you covered.
          </p>
        </div>
        <div className="services-grid">
          {services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className={`service-card ${s.accent}`.trim()}
            >
              <div className="card-icon">{s.icon}</div>
              <div className="card-title">{s.title}</div>
              <div className="card-desc">{s.desc}</div>
              <div className="card-link">{s.link}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="steps-band">
        <div className="section" style={{ padding: 0 }}>
          <div className="section-header">
            <div className="section-label">Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">
              Three simple steps to get started with AfroSamboza
            </p>
          </div>
          <div className="steps-grid">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Create Your Profile</h3>
              <p>
                Register and complete your profile with vehicle or property
                details.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Submit &amp; Verify</h3>
              <p>
                Our team reviews your submission and verifies all documents
                within 24–48 hrs.
              </p>
            </div>
            <div className="step">
              <div className="step-num green">3</div>
              <h3>Go Live &amp; Earn</h3>
              <p>Get approved and start driving, selling or renting immediately.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-label">Testimonials</div>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-sub">Real feedback from drivers, buyers and renters.</p>
        </div>

        {reviews.length > 0 && (
          <div className="testimonials-grid">
            {reviews.map((r) => (
              <div key={r.id} className="testimonial-card">
                <div className="testimonial-stars">
                  {"★".repeat(r.rating)}
                  <span className="off">{"★".repeat(5 - r.rating)}</span>
                </div>
                <p className="testimonial-msg">“{r.message}”</p>
                <div className="testimonial-who">
                  <div className="testimonial-avatar">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="testimonial-name">{r.name}</div>
                    <div className="testimonial-meta">
                      {[r.service, r.location].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: reviews.length > 0 ? 40 : 0 }}>
          <ShareExperience />
        </div>
      </div>
    </>
  );
}
