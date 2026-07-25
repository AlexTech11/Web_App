import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { paymentsEnabled } from "@/lib/paystack";
import { getFee } from "@/lib/settings";
import ListingDetail from "@/components/ListingDetail";
import { formatPrice, type Listing } from "@/lib/types";

export const dynamic = "force-dynamic";

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
  const [listing, reservationFee, rentalFee] = await Promise.all([
    fetchListing(id),
    getFee("listing_reservation"),
    getFee("rental_booking"),
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
    </div>
  );
}
