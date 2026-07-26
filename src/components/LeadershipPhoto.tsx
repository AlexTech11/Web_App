"use client";

import { useState } from "react";

/**
 * Oval CEO photo. Loads /leadership.jpg from public/; falls back to initials
 * until the image file is added.
 */
export default function LeadershipPhoto() {
  const [err, setErr] = useState(false);

  if (err) {
    return <div className="leader-photo initials">AU</div>;
  }
  return (
    <div className="leader-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/leadership.jpg" alt="Alex Ukpong" onError={() => setErr(true)} />
    </div>
  );
}
