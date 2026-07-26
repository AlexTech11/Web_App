-- Public bucket for site assets (e.g. the leadership photo). Upload files via
-- the Supabase dashboard; they are served publicly for the marketing pages.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "site_assets_public_read" on storage.objects
  for select using (bucket_id = 'site-assets');

-- Staff may also manage assets from the app if needed (dashboard uploads use
-- the service role and bypass this anyway).
create policy "site_assets_staff_write" on storage.objects
  for all
  using (bucket_id = 'site-assets' and public.is_staff())
  with check (bucket_id = 'site-assets' and public.is_staff());
