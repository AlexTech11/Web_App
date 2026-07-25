export type ListingType =
  | "car_sale"
  | "car_rent"
  | "house_sale"
  | "house_rent"
  | "land";

export type Platform = "bolt" | "uber" | "indrive";

export interface Listing {
  id: string;
  reference_no: string;
  type: ListingType;
  title: string;
  price: number | null;
  price_period: "day" | "year" | null;
  location: string;
  description: string | null;
  attributes: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface ActionResult {
  ok: boolean;
  reference?: string;
  id?: string;
  error?: string;
}

export function formatPrice(listing: Pick<Listing, "price" | "price_period">): string {
  if (listing.price == null) return "Price on request";
  const naira = `₦${Number(listing.price).toLocaleString("en-NG")}`;
  if (listing.price_period === "day") return `${naira} / day`;
  if (listing.price_period === "year") return `${naira} / yr`;
  return naira;
}
