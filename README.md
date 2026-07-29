# EquineFind

Cross-discipline equestrian event aggregator — search recognized competitions and schooling shows for eventing, dressage, show jumping, and hunters near you.

## Quick start

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

Requires `frontend/.env.local` with Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional: `NEXT_PUBLIC_GOOGLE_MAPS_KEY` for the map view.

## Architecture

```
equinefind/
└── frontend/           Next.js 14 (App Router)
    └── src/
        ├── app/        Pages and layouts
        ├── components/ Shared UI (EventCard, MapView, SearchBar, etc.)
        ├── hooks/      React Query hooks (useEvents, useVenue)
        ├── lib/        Supabase client, API helpers, geocoding
        ├── store/      Zustand filter state
        └── types/      TypeScript interfaces
```

Backend is Supabase (hosted Postgres with PostGIS):
- **PostgREST** for CRUD on events and venues
- **RPC function** `search_events()` for geo-radius search with filters
- **Supabase Auth** for admin login
- **Row Level Security** — public read, authenticated write

## Key business rules

- Free listings always — no paywall on basic listing
- Cancelled events stay visible (riders need to know)
- Events must have a venue (create placeholder if unknown)
- Radius search max 500 miles
