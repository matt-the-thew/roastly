create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  display_name text,
  avatar_url text
  created_at timestamp with time zone default now()
);