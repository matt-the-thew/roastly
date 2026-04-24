# Roastly Launch Spec

## Overview

A cafe discovery app where users browse cafes on a map, like their favorites, and share activity with friends. Launch scope is intentionally minimal: map browsing, likes, images, and a mutual-follow social graph with a chronological activity feed.

---

## Scope

### In Scope (Launch)
- Browse cafes on an interactive map (anonymous)
- Like/unlike cafes (authenticated)
- Cafe detail panel with images, description, like count, friend attribution
- Map marker hover popup (name, like count, friend avatars)
- Right-sidebar social feed (friends' likes, chronological)
- Mutual friend system via alphanumeric friend codes
- Friend requests with 7-day expiry
- User profiles with bio, liked cafes, mutual friends
- Public/private account toggle
- Google OAuth + email/password sign-in
- Onboarding flow for new users
- Profile picture upload in settings

### Out of Scope (Future)
- Push/email notifications for likes or feed activity
- User-uploaded cafe images
- Events, check-ins ("actively here"), sponsored cafe promotions
- Feed ranking/relevance signals
- Password-less magic link sign-in

---

## Authentication

### Methods
- **Google OAuth** — existing flow, pulls display name and avatar automatically
- **Email/password** — new; Resend handles all transactional email (verification, password reset) via Supabase's SMTP override

### Onboarding Flow
Triggered once, on first sign-in, before the user reaches the map:
1. **Username** — required, unique, max 30 chars
2. **Bio** — optional, max 200 chars
3. **Avatar** — auto-generated initials avatar (colored circle) assigned on creation; user can upload a real photo later in Settings

Google sign-in users go through the same onboarding screen to set a username and bio; their Google avatar is pre-filled but replaceable.

---

## User Profiles

### Public Fields (visible to everyone)
- Username
- Display name
- Profile picture

### Full Profile (visible to self + mutual friends, or anyone if account is public)
- Bio (max 200 chars)
- Friend count
- Mutual friends with the viewer
- Liked cafes (ordered by most recent)

### Privacy
- **Default: public**
- Users can toggle to private at any time; existing friends retain full access
- Private accounts show only username, display name, and profile picture to non-friends
- A private user's likes still increment a cafe's public like count, but their identity is not attributed

---

## Friend System

### Friend Codes
- Each user is assigned a short alphanumeric code on account creation (e.g. `X7K-29Q`)
- Codes are unique, system-generated, and immutable
- Displayed on the user's profile/settings page; users share them out-of-band
- Adding a friend: enter their code → sends a friend request

### Friend Requests
- **Sender** sees a pending state on the recipient's profile
- **Recipient** sees incoming requests and can: accept, deny, or ignore
- **Accept**: both parties are notified; friendship is created (mutual)
- **Deny**: request disappears silently; sender is not notified
- **Expiry**: requests auto-expire after 7 days; sender receives a nudge notification (in-app) that the request expired
- A denied or expired request can be re-sent

### Unfriending
- Either party can unfriend at any time
- The unfriended user is not notified; their friend count decrements

### Mutual Friends
- Visible on any user's profile to logged-in users
- Acts as organic discovery: you can send a friend request to a friend-of-a-friend directly from their profile

---

## Likes

- Simple toggle (like / unlike) — no rating system, no downvotes
- Requires authentication; anonymous users see like counts but cannot like
- Like count is always public
- On a public account: like is attributed by name/avatar in cafe detail and social feed
- On a private account: like is anonymous publicly; friends can still see attribution

---

## Cafe Detail Panel

Shown in the right sidebar when a cafe marker is clicked. Contains:
- Cafe name
- Description
- Image carousel (up to 6 images, stored in Supabase Storage)
- Total like count
- Friend attribution: avatars of friends who liked this cafe, e.g. "Alex and 2 others liked this"
- Like/unlike button

---

## Map Marker Hover Popup

Minimal overlay on hover over a cafe marker:
- Cafe name
- Total like count
- Avatars of friends who liked this cafe (up to 3, then "+N")

---

## Social Feed (Right Sidebar)

- Visible to authenticated users
- Shows friends' like activity in reverse chronological order
- Each entry: friend avatar, friend name, cafe name, timestamp
- Feed is pull-only at launch (no push/email notifications)
- Future: events, check-ins, sponsored entries

---

## Image Hosting

- **Supabase Storage** — already in stack, no new vendor needed
- ~6 images per cafe, ~50 cafes at launch (~300 images total, ~60MB)
- Images loaded dynamically by map bounding box (12–15 cafes at a time) with aggressive caching
- Admin-only uploads at launch; user uploads are a future feature
- Images compressed on upload to reasonable sizes (max ~1200px wide) to control egress

---

## Database Schema (New Tables)

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users |
| username | text | unique |
| display_name | text | |
| bio | text | max 200 chars |
| avatar_url | text | Supabase Storage path |
| friend_code | text | unique, system-generated (e.g. X7K-29Q) |
| is_private | boolean | default false |
| created_at | timestamptz | |

### `likes`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → profiles |
| cafe_id | uuid | FK → cafes_public |
| created_at | timestamptz | |

Unique constraint on `(user_id, cafe_id)`.

### `friendships`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| requester_id | uuid | FK → profiles |
| addressee_id | uuid | FK → profiles |
| status | enum | `pending` \| `accepted` \| `denied` |
| created_at | timestamptz | |
| expires_at | timestamptz | created_at + 7 days |

Unique constraint on `(requester_id, addressee_id)`. A mutual friendship is a single row with `status = accepted`.

### `cafe_images`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| cafe_id | uuid | FK → cafes_public |
| storage_path | text | Supabase Storage path |
| display_order | integer | 0-indexed |
| created_at | timestamptz | |

---

## Row-Level Security (RLS)

Key policies:
- `profiles`: anyone can read public fields; full profile readable only by self or mutual friends (or if account is public)
- `likes`: insert/delete only by the owning user; reads are public (but join to profiles respects privacy)
- `friendships`: readable only by requester or addressee; insertable by any authenticated user; updatable only by addressee
- `cafe_images`: public read; write restricted to admin role

---

## Email (Resend)

Configured via Supabase's SMTP override using a Resend API key. Handles:
- Email verification on sign-up
- Password reset
- Friend request expiry nudge (in-app first, email TBD post-launch)

---

## Settings Page

- Update display name
- Update bio
- Upload/replace profile picture
- Toggle public/private account
- View and copy friend code
- Change password (email accounts only)
- Delete account

---

## Open Questions / Post-Launch Decisions

- Friend request expiry nudge: in-app banner only at launch, email nudge later
- Feed pagination: infinite scroll vs. load-more button
- Like count display on map markers: always visible or only on hover?
- Username change policy: allowed freely, or locked after set?
- User-uploaded cafe images: moderation strategy TBD
