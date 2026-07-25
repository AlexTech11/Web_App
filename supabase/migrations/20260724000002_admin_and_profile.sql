-- Admin deletes, owner-managed listing photos, and admin user deletion.

-- ── Admin delete policies ──────────────────────────────────────────────
create policy "listings_delete_admin" on public.listings
  for delete using (public.is_admin());
create policy "driver_reg_delete_admin" on public.driver_registrations
  for delete using (public.is_admin());
create policy "enquiries_delete_admin" on public.enquiries
  for delete using (public.is_admin());
create policy "bookings_delete_admin" on public.bookings
  for delete using (public.is_admin());

-- ── Owner-managed listing photos ───────────────────────────────────────
-- Lets a signed-in seller set the photo list on THEIR OWN listing without a
-- broad UPDATE policy (which would expose status, approved_by, etc.).
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
     and owner_id = auth.uid();
end;
$$;

grant execute on function public.set_listing_photos(uuid, jsonb) to authenticated;

-- ── Admin: delete a user account ───────────────────────────────────────
-- Removes the auth user (cascades to profiles; content FKs are set null).
-- Guarded so only admins can call it and no one can delete themselves.
create or replace function public.admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'cannot delete your own account';
  end if;
  delete from auth.users where id = p_user_id;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;
