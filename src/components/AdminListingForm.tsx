"use client";

import { startTransition, useActionState, useState } from "react";
import { createAdminListing } from "@/app/admin/actions";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { MAX_DOC_BYTES, safeFileName } from "@/lib/documents";
import type { ActionResult, ListingType } from "@/lib/types";

const types: { id: ListingType; label: string }[] = [
  { id: "car_sale", label: "🚗 Car for Sale" },
  { id: "car_rent", label: "🔑 Car Rental" },
  { id: "house_sale", label: "🏠 House for Sale" },
  { id: "house_rent", label: "🏢 House for Rent" },
  { id: "land", label: "🌳 Land" },
];

const MAX_PHOTOS = 10;

export default function AdminListingForm() {
  const [type, setType] = useState<ListingType>("car_sale");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    createAdminListing,
    null
  );

  const isRental = type === "car_rent" || type === "house_rent";
  const isCar = type === "car_sale" || type === "car_rent";
  const isHouse = type === "house_sale" || type === "house_rent";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const formData = new FormData(e.currentTarget);
    formData.delete("photo_files");

    if (photos.length > 0) {
      const supabase = createSupabaseBrowser();
      const urls: string[] = [];
      setUploading(true);
      for (const file of photos.slice(0, MAX_PHOTOS)) {
        if (file.size > MAX_DOC_BYTES) {
          setUploadError(`${file.name}: larger than 5 MB.`);
          setUploading(false);
          return;
        }
        const path = `listings/${crypto.randomUUID()}-${safeFileName(file.name)}`;
        const { error } = await supabase.storage
          .from("listing-photos")
          .upload(path, file, { contentType: file.type });
        if (error) {
          setUploadError("A photo failed to upload — try again.");
          setUploading(false);
          return;
        }
        urls.push(supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl);
      }
      setUploading(false);
      formData.set("photos", JSON.stringify(urls));
    }

    startTransition(() => formAction(formData));
  }

  return (
    <div className="form-container wide">
      <div className="form-title">Add a Listing</div>
      <div className="form-subtitle">Goes live immediately on the marketplace.</div>

      <div className="platform-tabs">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${type === t.id ? "active" : ""}`}
            onClick={() => setType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="type" value={type} />
        {isRental && (
          <input type="hidden" name="price_period" value={type === "car_rent" ? "day" : "year"} />
        )}
        <div className="form-grid">
          <div className="field span2">
            <label htmlFor="al-title">Title</label>
            <input id="al-title" name="title" type="text" placeholder={isCar ? "e.g. Toyota Camry 2019" : type === "land" ? "e.g. 600 sqm Plot" : "e.g. 3-Bedroom Duplex"} required />
          </div>
          <div className="field">
            <label htmlFor="al-price">
              {type === "car_rent" ? "Daily Rate (₦)" : type === "house_rent" ? "Annual Rent (₦)" : "Price (₦)"}
            </label>
            <input id="al-price" name="price" type="number" placeholder="9000000" required />
          </div>
          <div className="field">
            <label htmlFor="al-location">Location</label>
            <input id="al-location" name="location" type="text" placeholder="e.g. Abuja, Wuse" required />
          </div>
          <div className="field">
            <label htmlFor="al-cname">Contact Name</label>
            <input id="al-cname" name="contact_name" type="text" placeholder="Seller / agent" required />
          </div>
          <div className="field">
            <label htmlFor="al-cphone">Contact Phone</label>
            <input id="al-cphone" name="contact_phone" type="tel" placeholder="08012345678" required />
          </div>

          <div className="field">
            <label htmlFor="al-emoji">Icon (emoji)</label>
            <input id="al-emoji" name="attr_emoji" type="text" placeholder={isCar ? "🚗" : type === "land" ? "🌳" : "🏠"} defaultValue={isCar ? "🚗" : type === "land" ? "🌳" : "🏠"} maxLength={4} />
          </div>

          {isCar && (
            <>
              <div className="field">
                <label htmlFor="al-year">Year</label>
                <input id="al-year" name="attr_year" type="number" placeholder="2019" />
              </div>
              <div className="field">
                <label htmlFor="al-trans">Transmission</label>
                <select id="al-trans" name="attr_transmission"><option>Automatic</option><option>Manual</option></select>
              </div>
              <div className="field">
                <label htmlFor="al-fuel">Fuel</label>
                <select id="al-fuel" name="attr_fuel"><option>Petrol</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select>
              </div>
              {type === "car_rent" && (
                <div className="field">
                  <label htmlFor="al-seats">Seats</label>
                  <input id="al-seats" name="attr_seats" type="number" placeholder="4" />
                </div>
              )}
            </>
          )}
          {isHouse && (
            <>
              <div className="field">
                <label htmlFor="al-beds">Bedrooms</label>
                <input id="al-beds" name="attr_beds" type="number" placeholder="3" />
              </div>
              <div className="field">
                <label htmlFor="al-baths">Bathrooms</label>
                <input id="al-baths" name="attr_baths" type="number" placeholder="3" />
              </div>
              <div className="field">
                <label htmlFor="al-size">Size (m²)</label>
                <input id="al-size" name="attr_size_sqm" type="number" placeholder="220" />
              </div>
            </>
          )}
          {type === "land" && (
            <>
              <div className="field">
                <label htmlFor="al-lsize">Size (sqm)</label>
                <input id="al-lsize" name="attr_size_sqm" type="number" placeholder="600" />
              </div>
              <div className="field">
                <label htmlFor="al-title-doc">Title Document</label>
                <select id="al-title-doc" name="attr_title_doc"><option>C of O</option><option>R of O</option><option>Survey Plan</option><option>Gazette</option><option>Other</option></select>
              </div>
            </>
          )}

          <div className="field span2">
            <label htmlFor="al-desc">Description</label>
            <textarea id="al-desc" name="description" placeholder="Condition, features, extras…" />
          </div>

          <div className="field span2">
            <label htmlFor="al-photos">Photos (up to {MAX_PHOTOS})</label>
            <input
              id="al-photos"
              name="photo_files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS))}
            />
            {photos.length > 0 && (
              <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "none", letterSpacing: 0 }}>
                {photos.length} selected
              </span>
            )}
          </div>
        </div>

        {uploadError && <div className="error-msg">⚠️ {uploadError}</div>}

        <div className="form-actions" style={{ marginTop: 24 }}>
          <button type="submit" className="btn-primary" disabled={pending || uploading}>
            {uploading ? "Uploading photos…" : pending ? "Creating…" : "Create Listing"}
          </button>
        </div>
      </form>

      {state?.ok && (
        <div className="success-msg">
          ✅ <strong>Listing created &amp; live!</strong> Reference:{" "}
          <strong>{state.reference}</strong>
        </div>
      )}
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
    </div>
  );
}
