-- AfroSamboza — initial schema
-- Phase 1: public forms (driver registrations, listing interest, enquiries, bookings)
-- Phase 2/3 ready: profiles with roles, staff assignment, audit trail

-- ── ENUMS ──────────────────────────────────────────────────────────────
create type public.user_role as enum ('customer', 'staff', 'admin');
create type public.platform_type as enum ('bolt', 'uber', 'indrive');
create type public.registration_status as enum ('pending', 'in_review', 'approved', 'rejected');
create type public.listing_type as enum ('car_sale', 'car_rent', 'house_sale', 'house_rent', 'land');
create type public.listing_status as enum ('pending', 'live', 'rejected', 'sold', 'rented');
create type public.enquiry_status as enum ('new', 'in_progress', 'closed');
create type public.booking_status as enum ('requested', 'confirmed', 'completed', 'cancelled');

-- ── PROFILES ───────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  email text,
  role public.user_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helper (security definer avoids RLS recursion)
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── DRIVER REGISTRATIONS (Bolt / Uber / inDrive) ───────────────────────
create table public.driver_registrations (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  platform public.platform_type not null,
  full_name text not null,
  phone text not null,
  email text,
  state text not null,
  vehicle_make text not null,
  vehicle_model text not null,
  vehicle_year int,
  plate_number text,
  vehicle_colour text,
  licence_status text,
  identity_status text,          -- Uber: NIN/BVN availability
  service_category text,         -- inDrive: ride-hailing / delivery / cargo
  notes text,
  status public.registration_status not null default 'pending',
  assigned_staff_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_driver_reg_status on public.driver_registrations (status);
create index idx_driver_reg_platform on public.driver_registrations (platform);

-- ── LISTINGS (cars, rentals, houses, land) ─────────────────────────────
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  owner_id uuid references public.profiles (id) on delete set null,
  type public.listing_type not null,
  title text not null,
  price numeric(14, 2),
  price_period text,             -- null = one-off; 'day' | 'year' for rentals
  location text not null,
  description text,
  attributes jsonb not null default '{}'::jsonb,  -- beds, baths, mileage, title_doc, seats, transmission...
  contact_name text,
  contact_phone text,
  status public.listing_status not null default 'pending',
  approved_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_listings_status_type on public.listings (status, type);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── ENQUIRIES ──────────────────────────────────────────────────────────
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text not null,
  status public.enquiry_status not null default 'new',
  handled_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── BOOKINGS (car rentals) ─────────────────────────────────────────────
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique,
  listing_id uuid references public.listings (id) on delete set null,
  customer_id uuid references public.profiles (id) on delete set null,
  name text not null,
  phone text not null,
  pickup_date date not null,
  return_date date not null,
  pickup_location text,
  status public.booking_status not null default 'requested',
  created_at timestamptz not null default now()
);

-- ── STAFF ACTIVITY (audit trail) ───────────────────────────────────────
create table public.staff_activity (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.profiles (id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.driver_registrations enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.enquiries enable row level security;
alter table public.bookings enable row level security;
alter table public.staff_activity enable row level security;

-- profiles: own row; staff can read all; admin can update roles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- driver_registrations: anyone (incl. anon) may submit; owners see their own; staff manage all
create policy "driver_reg_insert_public" on public.driver_registrations
  for insert with check (status = 'pending' and assigned_staff_id is null);
create policy "driver_reg_select_own_or_staff" on public.driver_registrations
  for select using (user_id = auth.uid() or public.is_staff());
create policy "driver_reg_update_staff" on public.driver_registrations
  for update using (public.is_staff());

-- listings: public read of live listings; anon submissions land as pending; staff manage
create policy "listings_select_live" on public.listings
  for select using (status = 'live' or owner_id = auth.uid() or public.is_staff());
create policy "listings_insert_public" on public.listings
  for insert with check (status = 'pending' and approved_by is null);
create policy "listings_update_staff" on public.listings
  for update using (public.is_staff());

-- listing_images: visible with their listing; staff manage
create policy "listing_images_select" on public.listing_images
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'live' or l.owner_id = auth.uid() or public.is_staff())
    )
  );
create policy "listing_images_write_staff" on public.listing_images
  for all using (public.is_staff());

-- enquiries: anyone may submit; staff read/manage
create policy "enquiries_insert_public" on public.enquiries
  for insert with check (status = 'new' and handled_by is null);
create policy "enquiries_select_staff" on public.enquiries
  for select using (public.is_staff());
create policy "enquiries_update_staff" on public.enquiries
  for update using (public.is_staff());

-- bookings: anyone may request; own or staff read; staff manage
create policy "bookings_insert_public" on public.bookings
  for insert with check (status = 'requested');
create policy "bookings_select_own_or_staff" on public.bookings
  for select using (customer_id = auth.uid() or public.is_staff());
create policy "bookings_update_staff" on public.bookings
  for update using (public.is_staff());

-- staff_activity: staff write their own entries; admin reads
create policy "staff_activity_insert" on public.staff_activity
  for insert with check (staff_id = auth.uid() and public.is_staff());
create policy "staff_activity_select_admin" on public.staff_activity
  for select using (public.is_admin());
