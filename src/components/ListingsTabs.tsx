"use client";

import { useState } from "react";
import { BookingModal, EnquiryModal } from "@/components/ListingModals";
import PhotoGallery from "@/components/PhotoGallery";
import ShareButton from "@/components/ShareButton";
import { formatPrice, type Listing } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

type TabId = "cars-sale" | "cars-rent" | "properties";

const tabs: { id: TabId; label: string }[] = [
  { id: "cars-sale", label: "🚗 Cars for Sale" },
  { id: "cars-rent", label: "🔑 Car Rentals" },
  { id: "properties", label: "🏠 Houses & Land" },
];

function tabOf(listing: Listing): TabId {
  if (listing.type === "car_sale") return "cars-sale";
  if (listing.type === "car_rent") return "cars-rent";
  return "properties";
}

function badgeOf(listing: Listing): { cls: string; label: string } {
  if (listing.attributes.badge === "new") return { cls: "new", label: "New" };
  if (listing.type === "land") return { cls: "sale", label: "Land" };
  if (listing.type === "car_rent" || listing.type === "house_rent")
    return { cls: "rent", label: "For Rent" };
  return { cls: "sale", label: "For Sale" };
}

function metaOf(listing: Listing): string[] {
  const a = listing.attributes as Record<string, string | number | boolean>;
  const meta: string[] = [];
  if (a.transmission) meta.push(`⚙️ ${a.transmission}`);
  if (a.fuel) meta.push(`⛽ ${a.fuel}`);
  if (a.year) meta.push(`📅 ${a.year}`);
  if (a.seats) meta.push(`👥 ${a.seats} seats`);
  if (a.ac) meta.push("❄️ A/C");
  if (a.fourwd) meta.push("🛻 4WD");
  if (a.beds) meta.push(`🛏 ${a.beds} beds`);
  if (a.baths) meta.push(`🚿 ${a.baths} baths`);
  if (a.size_sqm) meta.push(`📐 ${Number(a.size_sqm).toLocaleString()} m²`);
  if (a.title_doc) meta.push(`📋 ${a.title_doc}`);
  if (a.pool) meta.push("🏊 Pool");
  if (a.zone) meta.push(`🏗️ ${a.zone}`);
  if (a.prepaid_meter) meta.push("⚡ Prepaid");
  return meta.slice(0, 3);
}

export default function ListingsTabs({
  listings,
  initialTab = "cars-sale",
  paymentsEnabled = false,
  reservationFee = 0,
  rentalFee = 0,
}: {
  listings: Listing[];
  initialTab?: TabId;
  paymentsEnabled?: boolean;
  reservationFee?: number;
  rentalFee?: number;
}) {
  const [active, setActive] = useState<TabId>(initialTab);
  const [modal, setModal] = useState<{ kind: "enquiry" | "booking"; listing: Listing } | null>(null);
  const [gallery, setGallery] = useState<{ photos: string[]; title: string } | null>(null);

  const visible = listings.filter((l) => tabOf(l) === active);

  return (
    <>
      <div className="platform-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          No live listings in this category yet — check back soon or{" "}
          <a href="/sell" style={{ color: "#7fc9a6" }}>
            list yours
          </a>
          .
        </div>
      ) : (
        <div className="listings-grid">
          {visible.map((l) => {
            const badge = badgeOf(l);
            const isRental = l.type === "car_rent";
            const photos = Array.isArray(l.attributes.photos)
              ? (l.attributes.photos as string[])
              : [];
            return (
              <div key={l.id} className="listing-card">
                <div
                  className="listing-img"
                  style={
                    photos[0]
                      ? {
                          backgroundImage: `url(${photos[0]})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          cursor: "pointer",
                        }
                      : undefined
                  }
                  onClick={
                    photos.length
                      ? () => setGallery({ photos, title: l.title })
                      : undefined
                  }
                  role={photos.length ? "button" : undefined}
                  aria-label={photos.length ? `View ${photos.length} photos` : undefined}
                >
                  {!photos[0] && ((l.attributes.emoji as string) ?? "🚗")}
                  <div className={`listing-badge ${badge.cls}`}>{badge.label}</div>
                  {photos.length > 0 && (
                    <div className="listing-photo-count">📷 {photos.length}</div>
                  )}
                </div>
                <div className="listing-body">
                  <div className="listing-title">{l.title}</div>
                  <div className="listing-sub">📍 {l.location}</div>
                  <div className="listing-price">{formatPrice(l)}</div>
                  <div className="listing-meta">
                    {metaOf(l).map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
                <div className="listing-actions">
                  <button
                    className="btn btn-gold btn-sm"
                    onClick={() =>
                      setModal({ kind: isRental ? "booking" : "enquiry", listing: l })
                    }
                  >
                    {isRental ? "Book Now" : "Enquire"}
                  </button>
                  <a
                    className="btn btn-outline btn-sm wa-inline"
                    href={whatsappLink(
                      `Hello AfroSamboza, I'm interested in ${l.title} (${l.reference_no}) at ${formatPrice(l)}. Is it still available?`
                    )}
                    target="_blank"
                    rel="noopener"
                  >
                    WhatsApp
                  </a>
                  <ShareButton
                    title={l.title}
                    subtitle={`${formatPrice(l)} · ${l.location}`}
                    listingId={l.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal?.kind === "enquiry" && (
        <EnquiryModal
          listing={modal.listing}
          onClose={() => setModal(null)}
          paymentsEnabled={paymentsEnabled}
          reservationFee={reservationFee}
        />
      )}
      {modal?.kind === "booking" && (
        <BookingModal
          listing={modal.listing}
          onClose={() => setModal(null)}
          paymentsEnabled={paymentsEnabled}
          rentalFee={rentalFee}
        />
      )}
      {gallery && (
        <PhotoGallery
          photos={gallery.photos}
          title={gallery.title}
          onClose={() => setGallery(null)}
        />
      )}
    </>
  );
}
