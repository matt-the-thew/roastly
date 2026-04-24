create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_user_cafe_unique unique (user_id, cafe_id)
);

alter table public.likes enable row level security;

-- Anyone can read likes (attribution gated in app layer)
create policy "likes_public_read"
  on public.likes for select
  using (true);

-- Authenticated users can like
create policy "likes_own_insert"
  on public.likes for insert
  with check (user_id = auth.uid());

-- Authenticated users can unlike their own
create policy "likes_own_delete"
  on public.likes for delete
  using (user_id = auth.uid());
