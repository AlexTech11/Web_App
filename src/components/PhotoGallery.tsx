"use client";

import { useCallback, useEffect, useState } from "react";

export default function PhotoGallery({
  photos,
  title,
  onClose,
}: {
  photos: string[];
  title: string;
  onClose: () => void;
}) {
  const [i, setI] = useState(0);
  const prev = useCallback(
    () => setI((v) => (v - 1 + photos.length) % photos.length),
    [photos.length]
  );
  const next = useCallback(
    () => setI((v) => (v + 1) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="gallery">
        <div className="gallery-head">
          <span>
            {title} — {i + 1}/{photos.length}
          </span>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="gallery-main">
          {photos.length > 1 && (
            <button className="gallery-nav prev" onClick={prev} aria-label="Previous">
              ‹
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[i]} alt={`${title} — photo ${i + 1}`} />
          {photos.length > 1 && (
            <button className="gallery-nav next" onClick={next} aria-label="Next">
              ›
            </button>
          )}
        </div>
        {photos.length > 1 && (
          <div className="gallery-thumbs">
            {photos.map((p, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p}
                src={p}
                alt=""
                className={idx === i ? "active" : ""}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
