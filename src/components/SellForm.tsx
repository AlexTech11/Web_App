"use client";

import { useActionState, useState } from "react";
import { submitListingInterest } from "@/app/actions";
import TurnstileWidget from "@/components/TurnstileWidget";
import type { ActionResult, ListingType } from "@/lib/types";

const interestTypes: { id: ListingType; icon: string; label: string }[] = [
  { id: "car_sale", icon: "🚗", label: "Sell My Car" },
  { id: "car_rent", icon: "🔑", label: "Rent Out Car" },
  { id: "house_sale", icon: "🏠", label: "Sell My House" },
  { id: "house_rent", icon: "🏢", label: "Rent Out House" },
  { id: "land", icon: "🌳", label: "Sell Land" },
];

export default function SellForm() {
  const [type, setType] = useState<ListingType>("car_sale");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitListingInterest,
    null
  );

  const isRental = type === "car_rent" || type === "house_rent";

  return (
    <div className="form-container wide">
      <div className="form-title">What are you listing?</div>
      <div className="form-subtitle">
        Select the type of asset you&apos;d like to sell, rent out, or list
      </div>

      <div className="interest-types">
        {interestTypes.map((t) => (
          <div
            key={t.id}
            className={`interest-card ${type === t.id ? "selected" : ""}`}
            onClick={() => setType(t.id)}
          >
            <div className="interest-icon">{t.icon}</div>
            <div className="interest-label">{t.label}</div>
          </div>
        ))}
      </div>

      <form action={formAction}>
        <input type="hidden" name="type" value={type} />
        {isRental && (
          <input type="hidden" name="price_period" value={type === "car_rent" ? "day" : "year"} />
        )}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="contact_name">Full Name</label>
            <input id="contact_name" name="contact_name" type="text" placeholder="Your name" required />
          </div>
          <div className="field">
            <label htmlFor="contact_phone">Phone</label>
            <input id="contact_phone" name="contact_phone" type="tel" placeholder="08012345678" required />
          </div>

          <div className="field span2">
            <label htmlFor="title">
              {type === "car_sale" || type === "car_rent"
                ? "Car Make, Model & Year"
                : type === "land"
                  ? "Listing Title"
                  : "Property Title"}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder={
                type === "car_sale" || type === "car_rent"
                  ? "e.g. Toyota Camry 2018"
                  : type === "land"
                    ? "e.g. Residential Plot – 600 sqm"
                    : "e.g. 3-Bedroom Duplex"
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="price">
              {type === "car_rent"
                ? "Daily Rate (₦)"
                : type === "house_rent"
                  ? "Annual Rent (₦)"
                  : "Asking Price (₦)"}
            </label>
            <input id="price" name="price" type="number" placeholder={type === "car_rent" ? "25000" : "9000000"} required />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" placeholder="e.g. Abuja, Wuse" required />
          </div>

          {type === "car_sale" && (
            <div className="field">
              <label htmlFor="attr_mileage">Mileage (km)</label>
              <input id="attr_mileage" name="attr_mileage" type="number" placeholder="e.g. 80000" />
            </div>
          )}
          {type === "car_rent" && (
            <div className="field">
              <label htmlFor="attr_availability">Availability</label>
              <select id="attr_availability" name="attr_availability">
                <option>Immediate</option>
                <option>Within 1 week</option>
                <option>Custom dates</option>
              </select>
            </div>
          )}
          {type === "house_sale" && (
            <>
              <div className="field">
                <label htmlFor="attr_property_type">Property Type</label>
                <select id="attr_property_type" name="attr_property_type">
                  <option>Duplex</option>
                  <option>Bungalow</option>
                  <option>Flat/Apartment</option>
                  <option>Mansion</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="attr_beds">Bedrooms</label>
                <select id="attr_beds" name="attr_beds">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                  <option>5+</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="attr_title_doc">Title Document</label>
                <select id="attr_title_doc" name="attr_title_doc">
                  <option>Certificate of Occupancy (C of O)</option>
                  <option>Deed of Assignment</option>
                  <option>Right of Occupancy</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="attr_size_sqm">Size (m²)</label>
                <input id="attr_size_sqm" name="attr_size_sqm" type="number" placeholder="e.g. 220" />
              </div>
            </>
          )}
          {type === "house_rent" && (
            <div className="field">
              <label htmlFor="attr_property_type">Property Type</label>
              <select id="attr_property_type" name="attr_property_type">
                <option>Flat</option>
                <option>Duplex</option>
                <option>Self-Contain</option>
                <option>Room</option>
                <option>Office Space</option>
              </select>
            </div>
          )}
          {type === "land" && (
            <>
              <div className="field">
                <label htmlFor="attr_size_sqm">Size (sqm)</label>
                <input id="attr_size_sqm" name="attr_size_sqm" type="number" placeholder="e.g. 600" />
              </div>
              <div className="field">
                <label htmlFor="attr_title_doc">Title Document</label>
                <select id="attr_title_doc" name="attr_title_doc">
                  <option>C of O</option>
                  <option>R of O</option>
                  <option>Survey Plan</option>
                  <option>Gazette</option>
                  <option>Other</option>
                </select>
              </div>
            </>
          )}

          <div className="field span2">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder={
                type === "car_rent"
                  ? "Features, rental terms, insurance status..."
                  : type === "land"
                    ? "Zone type, accessibility, utilities available..."
                    : "Condition, amenities, special features..."
              }
            />
          </div>

          <TurnstileWidget />
        </div>

        <div className="form-actions" style={{ marginTop: 28 }}>
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Submitting..." : "Submit Listing Interest"}
          </button>
        </div>
      </form>

      {state?.ok && (
        <div className="success-msg">
          ✅ <strong>Interest Received!</strong> Our team will contact you
          within 24 hours to finalise your listing. Reference:{" "}
          <strong>{state.reference}</strong>
        </div>
      )}
      {state && !state.ok && <div className="error-msg">⚠️ {state.error}</div>}
    </div>
  );
}
