-- Listing photos: up to 10 images per car / rental / property listing.
-- Public bucket so images render on the public marketplace. Photo public URLs
-- are stored in listings.attributes.photos (jsonb array) — no schema change.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Anyone can view listing photos (public marketplace).
create policy "listing_photos_public_read" on storage.objects
  for select using (bucket_id = 'listing-photos');

-- Anyone (incl. anonymous sellers using the intake form) may upload into listings/…
create policy "listing_photos_upload" on storage.objects
  for insert with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = 'listings'
  );
