-- Paystack payments: ride-hailing activation, listing reservation, rental booking.

create type public.payment_purpose as enum (
  'ride_activation',
  'listing_reservation',
  'rental_booking'
);
create type public.payment_status as enum ('pending', 'paid', 'failed');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  purpose public.payment_purpose not null,
  entity_type text not null,
  entity_id uuid,
  amount_kobo bigint not null,
  email text not null,
  status public.payment_status not null default 'pending',
  paystack_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_payments_status on public.payments (status);

-- Paid / reserved flags on the entities a payment unlocks
alter table public.driver_registrations add column paid boolean not null default false;
alter table public.bookings add column paid boolean not null default false;
alter table public.listings add column reserved_by text;
alter table public.listings add column reserved_at timestamptz;

-- ── RLS ────────────────────────────────────────────────────────────────
alter table public.payments enable row level security;

-- Anyone can start a payment (row is created pending before checkout).
create policy "payments_insert_public" on public.payments
  for insert with check (status = 'pending');
-- Staff can read/manage all payments for reconciliation.
create policy "payments_select_staff" on public.payments
  for select using (public.is_staff());
create policy "payments_update_staff" on public.payments
  for update using (public.is_staff());
-- Fulfilment (marking paid + unlocking the entity) is done server-side with
-- the service-role key in the webhook/callback, which bypasses RLS.
