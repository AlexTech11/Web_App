-- Admin user deletion now also wipes the user's content and uploaded files,
-- not just their login. Redefine the function idempotently.

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

  -- Content owned by the user
  delete from public.listings where owner_id = p_user_id;
  delete from public.driver_registrations where user_id = p_user_id;
  delete from public.bookings where customer_id = p_user_id;

  -- Uploaded files (documents + listing photos) uploaded by the user
  delete from storage.objects where owner = p_user_id;

  -- Finally the account (cascades to profiles)
  delete from auth.users where id = p_user_id;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;
