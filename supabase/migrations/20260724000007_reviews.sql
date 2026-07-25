-- Client reviews / testimonials. Submitted publicly (unapproved), shown once
-- an admin approves them.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  service text,
  rating int not null default 5 check (rating between 1 and 5),
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Anyone may leave a review (lands unapproved for moderation).
create policy "reviews_insert_public" on public.reviews
  for insert with check (approved = false);
-- Public sees approved reviews; staff see all.
create policy "reviews_select_approved_or_staff" on public.reviews
  for select using (approved = true or public.is_staff());
-- Staff approve/edit; admin delete.
create policy "reviews_update_staff" on public.reviews
  for update using (public.is_staff());
create policy "reviews_delete_admin" on public.reviews
  for delete using (public.is_admin());
