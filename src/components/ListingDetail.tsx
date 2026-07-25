"use client";

import { useState } from "react";
import { BookingModal, EnquiryModal } from "@/components/ListingModals";
import PhotoGallery from "@/components/PhotoGallery";
import ShareButton from "@/components/ShareButton";
import { formatPrice, type Listing } from "@/lib/types";
import { whatsappLink } from "@/lib/whatsapp";

function metaOf(listing: Listing): string[] {
  const a = listing.attributes as Record<string, string | number | boolean>;
  const meta: string[] = [];
  if (a.transmission) meta.push(`⚙️ ${a.transmission}`);
  if (a.fuel) meta.push(`⛽ ${a.fuel}`);
  if (a.year) meta.push(`📅 ${a.year}`);
  if (a.seats) meta.push(`👥 ${a.seats} seats`);
  if (a.beds) meta.push(`🛏 ${a.beds} beds`);
  if (a.baths) meta.push(`🚿 ${a.baths} baths`);
  if (a.size_sqm) meta.push(`📐 ${Number(a.size_sqm).toLocaleString()} m²`);
  if (a.title_doc) meta.push(`📋 ${a.title_doc}`);
  return meta;
}

export default function ListingDetail({
  listing,
  paymentsEnabled,
  reservationFee,
  rentalFee,
}: {
  listing: Listing;
  paymentsEnabled: boolean;
  reservationFee: number;
  rentalFee: number;
}) {
  const [modal, setModal] = useState<null | "enquiry" | "booking">(null);
  const [gallery, setGallery] = useState(false);
  const photos = Array.isArray(listing.attributes.photos)
    ? (listing.attributes.photos as string[])
    : [];
  const isRental = listing.type === "car_rent";

  return (
    <div className="detail-grid">
      <div
        className="detail-media"
        style={
          photos[0]
            ? { backgroundImage: `url(${photos[0]})`, cursor: "pointer" }
            : undefined
        }
        onClick={() => photos.length && setGallery(true)}
      >
        {!photos[0] && (
          <span className="detail-emoji">
            {(listing.attributes.emoji as string) ?? "🏷️"}
          </span>
        )}
        {photos.length > 0 && (
          <div className="listing-photo-count">📷 {photos.length} — view</div>
        )}
      </div>

      <div className="detail-info">
        <h1 className="detail-title">{listing.title}</h1>
        <div className="detail-price">{formatPrice(listing)}</div>
        <div className="detail-loc">📍 {listing.location}</div>
        <div className="listing-meta" style={{ marginTop: 14 }}>
          {metaOf(listing).map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        {listing.description && <p className="detail-desc">{listing.description}</p>}
        <div className="detail-ref">Ref {listing.reference_no}</div>

        <div className="detail-actions">
          <button
            className="btn btn-gold"
            onClick={() => setModal(isRental ? "booking" : "enquiry")}
          >
            {isRental ? "Book Now" : "Enquire"}
          </button>
          <a
            className="btn btn-outline"
            href={whatsappLink(
              `Hello AfroSamboza, I'm interested in ${listing.title} (${listing.reference_no}) at ${formatPrice(listing)}. Is it still available?`
            )}
            target="_blank"
            rel="noopener"
          >
            💬 WhatsApp
          </a>
          <ShareButton
            title={listing.title}
            subtitle={`${formatPrice(listing)} · ${listing.location}`}
            listingId={listing.id}
          />
        </div>
      </div>

      {gallery && (
        <PhotoGallery
          photos={photos}
          title={listing.title}
          onClose={() => setGallery(false)}
        />
      )}
      {modal === "enquiry" && (
        <EnquiryModal
          listing={listing}
          onClose={() => setModal(null)}
          paymentsEnabled={paymentsEnabled}
          reservationFee={reservationFee}
        />
      )}
      {modal === "booking" && (
        <BookingModal
          listing={listing}
          onClose={() => setModal(null)}
          paymentsEnabled={paymentsEnabled}
          rentalFee={rentalFee}
        />
      )}
    </div>
  );
}
