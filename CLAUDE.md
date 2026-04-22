# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Webpack with HMR polling)
pnpm build        # Production build
pnpm lint         # ESLint (flat config, ignores .next)
pnpm test         # Vitest
pnpm test:ui      # Vitest with browser UI dashboard

pnpm supabase:start   # Start local Supabase
pnpm supabase:stop    # Stop local Supabase
```

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS v4**
- **Supabase** — auth (Google OAuth) + Postgres database
- **Mapbox GL** via `react-map-gl` — interactive cafe map
- **Radix UI + Phosphor Icons** — component primitives
- **Vitest + React Testing Library** — tests run in jsdom
- **Zod** — schema validation

## Architecture

### Routing

App Router pages under `app/`:
- `/` — landing page
- `/auth/login`, `/auth/sign-up`, `/auth/confirm` — OAuth flow (Google)
- `/dashboard/homepage` — main protected map app
- `/about`, `/blog`, `/privacy-policy` — static pages

### Middleware / Auth (`proxy.ts`)

All requests pass through `proxy.ts` (the Next.js middleware). It instantiates `SessionHandler` (`lib/supabase/sessionhandler.ts`) on every request to refresh the Supabase JWT via cookies. Auth-based redirects (e.g. unauthenticated users → `/auth/login`) are currently stubbed out pending email verification setup.

Two Supabase clients exist:
- `lib/supabase/client.ts` — browser client using public anon key
- `lib/supabase/server.ts` — server client using async cookie store (for SSR)

### Data Flow (Dashboard)

1. `fetchLocations()` (`lib/fetchLocations.ts`) queries the `cafes_public` table and returns typed `Location[]`
2. `app/dashboard/homepage/page.tsx` calls this on mount and holds state
3. `MapComponent` renders Mapbox with markers; each marker mounts a React root via portal
4. `MapOverlay` controls the sidebar via a string `renderState` switch (`"list"` | `"details"` | `"submission"`)
5. State is threaded down via callback props — no Context API is used

### Key Types

`Location` (in `lib/fetchLocations.ts`) is the central data model — it carries all cafe fields: coordinates, vibe, brew_focus, rating, amenities, images, etc.

### Component Patterns

- **`renderState` switching**: `MapOverlay` renders `CafeList`, `CafeDetails`, or `CafeSubmissionForm` by matching a string state — extend by adding a new case
- **Map padding**: Sidebar open/close drives `easeTo` map padding so markers stay visible
- **Toast notifications**: async operations use `react-hot-toast` promise toasts

## Environment Variables

See `.env.example`:
```
NEXT_PUBLIC_ROASTLY_SUPABASE_URL
NEXT_PUBLIC_ROASTLY_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_ROASTLY_SUPABASE_ANON_KEY
NEXT_PUBLIC_ROASTLY_SITE_URL
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET
```
