-- Allow staff/admin (not just the owner) to set a listing's photos, so photos
-- can be added/removed from the admin listing editor too.
create or replace function public.set_listing_photos(
  p_listing_id uuid,
  p_photos jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.listings
     set attributes = jsonb_set(coalesce(attributes, '{}'::jsonb), '{photos}', p_photos),
         updated_at = now()
   where id = p_listing_id
     and (owner_id = auth.uid() or public.is_staff());
end;
$$;

grant execute on function public.set_listing_photos(uuid, jsonb) to authenticated;
