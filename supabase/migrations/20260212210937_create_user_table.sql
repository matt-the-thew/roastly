create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  first_name text,
  last_name text,
  avatar_url text,
  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;


