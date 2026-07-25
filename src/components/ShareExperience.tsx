"use client";

import { useState } from "react";
import ReviewForm from "@/components/ReviewForm";

export default function ShareExperience({
  className = "btn btn-gold",
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        ✍️ Share your experience
      </button>
      {open && (
        <div
          className="modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>Share your experience</h3>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <ReviewForm embedded />
          </div>
        </div>
      )}
    </>
  );
}
