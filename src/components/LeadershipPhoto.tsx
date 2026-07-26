"use client";

import { useState } from "react";

/**
 * Oval CEO photo, served from the public Supabase Storage 'site-assets'
 * bucket (upload a file named leadership.jpg there). Falls back to initials
 * until the image exists.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PHOTO_URL = `${SUPABASE_URL}/storage/v1/object/public/site-assets/leadership.jpg`;

export default function LeadershipPhoto() {
  const [err, setErr] = useState(false);

  if (err || !SUPABASE_URL) {
    return <div className="leader-photo initials">AU</div>;
  }
  return (
    <div className="leader-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={PHOTO_URL} alt="Alex Ukpong" onError={() => setErr(true)} />
    </div>
  );
}
