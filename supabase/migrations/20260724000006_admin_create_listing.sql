-- Let staff/admin create listings directly (any status, e.g. 'live') from the
-- admin dashboard. Public inserts remain limited to 'pending' by the existing
-- listings_insert_public policy.
create policy "listings_insert_staff" on public.listings
  for insert with check (public.is_staff());
