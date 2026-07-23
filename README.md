# AfroSamboza Web App

Nigeria's platform for ride-hailing car registration (Bolt, Uber, inDrive), car sales & rentals, and property listings. Based in Abuja, FCT.

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres, Auth, Storage, RLS) · Vercel · GitHub

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + publishable key
npm run dev
```

Open http://localhost:3000.

## Database setup (Supabase)

Migrations live in `supabase/migrations/`. Apply them with the Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref nyndhhtfjrwzmqeldvun
supabase db push
```

Or paste each migration file into the Supabase Dashboard → SQL Editor, in filename order.

Schema highlights:
- `driver_registrations` — Bolt/Uber/inDrive registration submissions
- `listings` + `listing_images` — cars, rentals, houses, land (public read of `live` rows only)
- `enquiries`, `bookings` — customer interest & rental bookings
- `profiles` (customer/staff/admin roles) + `staff_activity` audit trail — used from Phase 2
- Row Level Security on every table; anonymous visitors can only create `pending` submissions

## Deployment (Vercel)

1. Push to GitHub (`AlexTech11/Web_App`).
2. In Vercel → **Add New Project** → import the repo.
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Every PR gets a preview deployment; `main` deploys to production.

## Roadmap

- **Phase 1 (this repo)** — public site: home, ride-hailing registration, listings marketplace, sell/rent intake. All forms persist to Supabase.
- **Phase 2** — Supabase Auth (email + phone OTP), user dashboard, document/image uploads.
- **Phase 3** — staff & admin dashboards, approval workflows, real metrics, audit log.
- **Phase 4** — custom domain, rate limiting, Paystack payments, WhatsApp integration.
