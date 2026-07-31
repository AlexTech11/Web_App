"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateListing } from "@/app/dashboard/actions";
import ListingPhotosManager from "@/components/ListingPhotosManager";

export interface EditableListing {
  id: string;
  title: string;
  price: number | null;
  price_period: "day" | "year" | null;
  location: string;
  description: string | null;
  photos?: string[];
}

export default function ListingEditor({ listing }: { listing: EditableListing }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const priceLabel =
    listing.price_period === "day"
      ? "Daily Rate (₦)"
      : listing.price_period === "year"
        ? "Annual Rent (₦)"
        : "Price (₦)";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await updateListing(listing.id, new FormData(e.currentTarget));
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not save.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
        ✏️ Edit
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="listing-edit">
      <div className="form-grid">
        <div className="field span2">
          <label>Title</label>
          <input name="title" type="text" defaultValue={listing.title} required />
        </div>
        <div className="field">
          <label>{priceLabel}</label>
          <input name="price" type="number" defaultValue={listing.price ?? ""} required />
        </div>
        <div className="field">
          <label>Location</label>
          <input name="location" type="text" defaultValue={listing.location} required />
        </div>
        <div className="field span2">
          <label>Description</label>
          <textarea name="description" defaultValue={listing.description ?? ""} />
        </div>
      </div>

      <div className="field span2" style={{ marginTop: 16 }}>
        <label>Photos (add or remove — up to 10)</label>
        <ListingPhotosManager listingId={listing.id} photos={listing.photos ?? []} />
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "13px 20px", borderRadius: 10 }}
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
