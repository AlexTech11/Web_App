import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { paymentsEnabled } from "@/lib/paystack";
import { getFee } from "@/lib/settings";
import ListingDetail from "@/components/ListingDetail";
import ShareExperience from "@/components/ShareExperience";
import { formatPrice, type Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Review {
  id: string;
  name: string;
  location: string | null;
  service: string | null;
  rating: number;
  message: string;
}

async function fetchReviews(): Promise<Review[]> {
  try {
    const { data } = await getSupabase()
      .from("reviews")
      .select("id, name, location, service, rating, message")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(3);
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}

const SELECT =
  "id, reference_no, type, title, price, price_period, location, description, attributes, status, created_at";

async function fetchListing(id: string): Promise<Listing | null> {
  try {
    const { data } = await getSupabase()
      .from("listings")
      .select(SELECT)
      .eq("id", id)
      .eq("status", "live")
      .single();
    return (data as Listing) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing) return { title: "Listing not found" };
  const photos = Array.isArray(listing.attributes.photos)
    ? (listing.attributes.photos as string[])
    : [];
  const desc = `${listing.title} in ${listing.location} — ${formatPrice(listing)} on AfroSamboza.`;
  return {
    title: `${listing.title} — ${formatPrice(listing)}`,
    description: desc,
    openGraph: {
      title: listing.title,
      description: `${formatPrice(listing)} · ${listing.location}`,
      images: photos[0] ? [photos[0]] : [],
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, reservationFee, rentalFee, reviews] = await Promise.all([
    fetchListing(id),
    getFee("listing_reservation"),
    getFee("rental_booking"),
    fetchReviews(),
  ]);
  if (!listing) notFound();

  return (
    <div className="section">
      <p style={{ marginBottom: 16 }}>
        <Link href="/listings" style={{ color: "#7fc9a6" }}>
          ← Back to listings
        </Link>
      </p>
      <ListingDetail
        listing={listing}
        paymentsEnabled={paymentsEnabled()}
        reservationFee={reservationFee}
        rentalFee={rentalFee}
      />

      {reviews.length > 0 && (
        <div style={{ marginTop: 70 }}>
          <div className="section-header" style={{ marginBottom: 30 }}>
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
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
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <ShareExperience className="btn btn-outline" />
          </div>
        </div>
      )}
    </div>
  );
}
