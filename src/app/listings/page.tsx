import type { Metadata } from "next";
import ListingsTabs from "@/components/ListingsTabs";
import { getSupabase } from "@/lib/supabase";
import { paymentsEnabled } from "@/lib/paystack";
import { getFee } from "@/lib/settings";
import type { Listing } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cars, Rentals & Properties",
  description:
    "Browse verified cars for sale, car rentals, houses and land across Nigeria. Updated daily on AfroSamboza.",
};

// Always fetch fresh listings
export const dynamic = "force-dynamic";

async function getLiveListings(): Promise<Listing[]> {
  try {
    const { data, error } = await getSupabase()
      .from("listings")
      .select(
        "id, reference_no, type, title, price, price_period, location, description, attributes, status, created_at"
      )
      .eq("status", "live")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("listings fetch failed:", error.message);
      return [];
    }
    return (data as Listing[]) ?? [];
  } catch (err) {
    console.error("listings fetch failed:", err);
    return [];
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const [listings, reservationFee, rentalFee] = await Promise.all([
    getLiveListings(),
    getFee("listing_reservation"),
    getFee("rental_booking"),
  ]);
  const initialTab =
    tab === "cars-rent" || tab === "properties" ? tab : "cars-sale";

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Marketplace</div>
        <h2 className="section-title">Cars, Rentals &amp; Properties</h2>
        <p className="section-sub">
          Browse verified listings across Nigeria. Updated daily.
        </p>
      </div>
      <ListingsTabs
        listings={listings}
        initialTab={initialTab}
        paymentsEnabled={paymentsEnabled()}
        reservationFee={reservationFee}
        rentalFee={rentalFee}
      />
    </div>
  );
}
