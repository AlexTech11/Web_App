-- Account ban status:
--   none    — normal
--   partial — can sign in, but blocked from new registrations & listings
--   full    — cannot sign in at all
alter table public.profiles
  add column ban_status text not null default 'none'
  check (ban_status in ('none', 'partial', 'full'));
