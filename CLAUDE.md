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
- **Supabase** — auth (Google OAuth + email/password via Resend) + Postgres + Storage
- **Mapbox GL** via `react-map-gl` — interactive cafe map
- **Radix UI + Phosphor Icons** — component primitives
- **Vitest + React Testing Library** — tests run in jsdom
- **Zod** — schema validation

## Architecture

### Routing

App Router pages under `app/`:
- `/` — landing page
- `/auth/login`, `/auth/sign-up`, `/auth/confirm` — auth flow (Google OAuth + email/password)
- `/onboarding` — first-time profile setup (username, bio, avatar); triggered from `/auth/confirm` when no profile row exists
- `/dashboard/homepage` — main protected map app
- `/profile/[username]` — public user profile (bio, liked cafes, mutual friends, friend actions)
- `/settings` — profile editing, avatar upload, privacy toggle, friend code, account management
- `/about`, `/blog`, `/privacy-policy` — static pages

### Middleware / Auth (`proxy.ts`)

All requests pass through `proxy.ts` (the Next.js middleware). It instantiates `SessionHandler` (`lib/supabase/sessionhandler.ts`) on every request to refresh the Supabase JWT via cookies.

Two Supabase clients exist:
- `lib/supabase/client.ts` — browser client using public anon key
- `lib/supabase/server.ts` — server client using async cookie store (for SSR)

### Database Tables (Supabase)

Beyond the existing `cafes` table and `cafes_public` view:

| Table | Purpose |
|---|---|
| `profiles` | User profile: username, display_name, bio, avatar_url, friend_code, is_private |
| `likes` | Cafe likes: user_id + cafe_id (unique constraint) |
| `friendships` | Mutual friend graph: requester_id, addressee_id, status (pending/accepted/denied), expires_at |
| `cafe_images` | Ordered images per cafe, referenced by Supabase Storage paths |

`friends` is a symmetric view over `friendships` for easy bidirectional lookups.

All tables have RLS enabled. See `supabase/migrations/` for full policies.

### Data Layer (`lib/supabase/`)

| File | Purpose |
|---|---|
| `profile.ts` | CRUD for profiles; `getInitials`, `getAvatarColor` helpers |
| `likes.ts` | `toggleLike`, `getLikeCount`, `getLikersForCafe`, `getUserLikedCafeIds` |
| `friends.ts` | `getFriends`, `getFriendIds`, `sendFriendRequest`, `respondToRequest`, `getMutualFriends` |
| `feed.ts` | `getSocialFeed` — friend like activity, chronological |
| `images.ts` | `getCafeImages`, `getPublicUrl` for Supabase Storage |

### Data Flow (Dashboard)

1. `fetchLocations()` (`lib/fetchLocations.ts`) queries `cafes_public` and returns `Location[]`
2. `MapProvider` (wraps all dashboard children) bootstraps auth state, loads `Profile` and `Set<friendIds>` for the current user
3. `MapComponent` renders Mapbox markers — each marker is a detached React root (`createRoot`) that receives `cafeId`, `cafeName`, and `friendIds[]` as props. Markers are rebuilt when `friendIds` changes.
4. `MapOverlay` renders two fixed sidebars:
   - **Left**: `CafeList` / `CafeDetails` / `CafeSubmissionForm` switched by `overlayView` string state
   - **Right**: `SocialFeed` — always visible, shows friends' like activity
5. `MapUserControls` shows the logo + auth controls (profile link, settings, sign out)

### Key Types

- `Location` (`lib/fetchLocations.ts`) — central cafe model
- `Profile` (`lib/supabase/profile.ts`) — user profile
- `Friendship` (`lib/supabase/friends.ts`) — friend request/relationship row
- `FeedEntry` (`lib/supabase/feed.ts`) — social feed item
- `OverlayView` (`lib/MapContext.tsx`) — `"cafeList" | "cafeDetails" | "submissionForm"`

### MapContext

`lib/MapContext.tsx` is the single shared context for the dashboard. It holds:
- Map state: `locations`, `selectedLocation`, `selectedCity`, `overlayView`, `sidebarVisible`
- Auth/social state: `user` (Supabase `User`), `profile` (`Profile`), `friendIds` (`Set<string>`)
- `refreshProfile()` — call after profile mutations to re-sync context

### Component Patterns

- **`overlayView` switching**: `MapOverlay` renders left-sidebar content by matching a string — extend by adding a new case
- **Detached marker roots**: Map markers are rendered outside the React tree via `createRoot`. They receive all needed data as props — do not try to use context hooks inside them.
- **Optimistic like updates**: `LikeButton` updates state immediately and reverts on error
- **Privacy gating**: Done in application layer — RLS allows all reads; components filter based on `is_private` + friendship status
- **Toast notifications**: async operations use `react-hot-toast`

### Onboarding Flow

`/auth/confirm` checks for a `profiles` row after token verification. If none exists, it redirects to `/onboarding` instead of `/dashboard/homepage`. The onboarding page creates the profile row and then navigates to the dashboard.

### Friend Codes

7-character uppercase alphanumeric (e.g. `X7K29QA`), displayed as `XXX-XXXX`. Generated by a Postgres function (`generate_friend_code`) on profile insert. Immutable after creation.

### Image Hosting

Cafe images are stored in Supabase Storage under the `cafe-images` bucket, referenced by `storage_path` in `cafe_images`. User avatars are in the `avatars` bucket. `getPublicUrl()` in `lib/supabase/images.ts` resolves storage paths to public URLs.

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

Resend is configured via Supabase's SMTP override in the Supabase dashboard (not an env var in this repo).
