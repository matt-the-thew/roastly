-- Extend function of cafe table to trigger decision-response from users
CREATE TABLE cafes (

  -- IDENTITY
  id uuid primary key default gen_random_uuid(),
  name varchar(254) not null,
  slug text unique not null,

  -- LOCATION
  location geography(POINT) not null,

  -- FLAVORS (decision signal)
  roast_level text check (roast_level in ('light', 'medium', 'dark')),
  brew_focus text check (brew_focus in ('espresso', 'pour-over', 'both')),
  vibe text check (vibe in ('quiet', 'social', 'work-friendly', 'cozy', 'grab-and-go')),
  description text not null, 

  -- Eventually, could   OWNERS tables that lists owners for that cafe
  -- Eventually, could   business size/type to this table
  -- business_type text check (business_type in ('family-owned', 'locally-owned')
  -- business_size smallint default 1

  -- Amenities
  has_wifi boolean, 
  has_bathroom boolean, 
  has_outlets boolean, 
  has_patio boolean,

  -- Metadata
  is_verified boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);