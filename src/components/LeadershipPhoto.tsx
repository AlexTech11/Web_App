import { getSetting } from "@/lib/settings";

/**
 * Oval CEO photo. Reads the URL saved by the admin (Settings → Leadership
 * Photo) from the settings store; falls back to initials until one is set.
 * Server component, so there is never a broken-image flash.
 */
export default async function LeadershipPhoto() {
  const url = await getSetting("leadership_photo_url");
  if (!url) {
    return <div className="leader-photo initials">AU</div>;
  }
  return (
    <div className="leader-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Alex Ukpong" />
    </div>
  );
}
