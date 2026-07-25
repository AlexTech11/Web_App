-- Admin-editable app settings (payment fees, etc.). Key/value store.

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- Fees are not secret — anyone may read them (needed to show "Pay ₦X").
create policy "settings_read_all" on public.settings
  for select using (true);
-- Only admins can change settings.
create policy "settings_insert_admin" on public.settings
  for insert with check (public.is_admin());
create policy "settings_update_admin" on public.settings
  for update using (public.is_admin());

-- Default service fees (Naira)
insert into public.settings (key, value) values
  ('fee_ride_activation', '5000'::jsonb),
  ('fee_listing_reservation', '5000'::jsonb),
  ('fee_rental_booking', '5000'::jsonb)
on conflict (key) do nothing;
