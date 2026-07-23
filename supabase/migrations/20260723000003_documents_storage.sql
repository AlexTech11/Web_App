-- Phase 2: document uploads for driver registrations
-- Private 'documents' storage bucket + documents metadata on registrations

-- Attach uploaded document paths to a registration:
-- [{"type": "drivers_licence", "path": "registrations/<uuid>-file.jpg"}, ...]
alter table public.driver_registrations
  add column documents jsonb not null default '[]'::jsonb;

-- Private bucket, 5 MB per file, images + PDF only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Anyone (incl. anonymous applicants) may upload into registrations/…
-- Uploads are write-once: no update/delete policies exist.
create policy "docs_upload_registrations" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = 'registrations'
  );

-- Only the uploader (when signed in) and staff can read documents
create policy "docs_read_own_or_staff" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (owner = auth.uid() or public.is_staff())
  );
