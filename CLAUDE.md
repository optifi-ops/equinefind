# EquineFind

Equestrian event finder — browse horse shows, sign up for clinics, manage horses.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Postgres + Auth + RLS) — no separate API server
- **UI**: Radix UI primitives, React Query for data fetching
- **Auth**: Magic link via Supabase `signInWithOtp`
- **Supabase project ID**: `iaebexmgowovliuztmhz`

## Commands

```bash
cd frontend
npm run dev          # dev server on port 3001
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
```

## Environment Variables

`frontend/.env.local` (not committed):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

```
frontend/src/
  app/            # Next.js App Router pages
    account/      # Authenticated user hub (events, horses, settings, clinics)
    admin/        # Admin panel (events, venues CRUD)
    events/[slug] # Public event detail page
    search/       # Event search with filters, map, calendar views
    login/        # Magic link sign-in
  components/     # React components
  hooks/          # React Query hooks (useEvents, useClinics, useHorses, etc.)
  lib/
    api.ts        # All Supabase queries — single file, organized by domain
    auth.ts       # Supabase client + auth helpers
    timeBlocks.ts # Pure utility for generating/marking clinic time blocks
    utils.ts      # Formatting helpers
  types/          # TypeScript interfaces (event, clinic, horse, venue, user)
```

## Architecture Patterns

- **All DB queries** go through `src/lib/api.ts` — organized into `eventsApi`, `clinicApi`, `clinicSignupApi`, `horsesApi`, `savedEventsApi`, `venuesApi` objects
- **React Query hooks** in `src/hooks/` wrap api calls with cache keys. Mutations invalidate related query keys in `onSuccess`
- **Auth**: `useAuth()` hook returns `{ user, profile, loading, isOrganizer, isAdmin }`. Profile has a `role` field: `"user" | "organizer" | "admin"`
- **RLS**: All tables use Row Level Security. Organizer policies check `events.organizer_user_id = auth.uid()` via EXISTS subqueries
- **Account layout** (`/account/*`): sidebar nav on desktop (w-52 bg-charcoal), bottom tab bar on mobile
- **Clinic signups**: junction table `clinic_signup_horses` for multi-horse signups with live FK join to `horses` table (no snapshot)
- **Time blocks**: computed client-side from `clinic_slots.start_time/end_time/duration_minutes` — not stored as DB rows

## Design Tokens (Tailwind)

- **Colors**: charcoal (#1C1C1E), slate (#4A4A52), mist (#F5F4F1), hunter (#2C4A2E), gold (#B8973A), sage (#6B8F71)
- **Fonts**: `font-display` = Playfair Display (headings), `font-sans` = Inter (body)
- **Components**: `.card` (shadow-card + rounded), `.btn-primary` (bg-hunter), `.btn-secondary` (border), `.input` (border + rounded)
- **Border radius**: 4px default, not rounded

## Key Database Tables

- `events` — title, slug, dates, type (clinic/show/schooling), disciplines[], organizer_user_id
- `venues` — name, slug, address, lat/lng
- `clinic_details` — event_id FK, clinician info, signup dates, notes
- `clinic_slots` — clinic_detail_id FK, name, price_cents, max_capacity, duration_minutes, start_time, end_time, riders_per_lesson
- `clinic_signups` — slot FK, user_id, rider info, status (confirmed/waitlisted/cancelled), payment_status
- `clinic_signup_horses` — signup FK, horse_id FK (live join), ride_time, sort_order
- `horses` — user_id FK, name, breed, level, disciplines[], usef/usea/usdf numbers
- `profiles` — user_id, display_name, compete_name, role, email
- `saved_events` — user_id, event_id (upsert on conflict)

## Conventions

- Server components by default; add `"use client"` only when needed
- Prefer editing existing files over creating new ones
- Single `api.ts` file — don't split into separate API files
- Keep components in `src/components/` (flat, not nested by feature)
- Use Radix UI for dialogs, popovers, dropdowns — not custom implementations
- Supabase migrations via MCP tool `apply_migration` (use project ID above)
