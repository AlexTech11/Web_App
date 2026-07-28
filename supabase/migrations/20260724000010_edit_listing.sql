-- Let a listing's owner (or any staff/admin) edit its core details after
-- submission, without exposing status/approval/reservation fields. Photos are
-- managed separately by set_listing_photos.
create or replace function public.update_listing_details(
  p_id uuid,
  p_title text,
  p_price numeric,
  p_location text,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.listings
     set title = coalesce(nullif(trim(p_title), ''), title),
         price = coalesce(p_price, price),
         location = coalesce(nullif(trim(p_location), ''), location),
         description = nullif(trim(p_description), ''),
         updated_at = now()
   where id = p_id
     and (owner_id = auth.uid() or public.is_staff());
end;
$$;

grant execute on function public.update_listing_details(uuid, text, numeric, text, text) to authenticated;
