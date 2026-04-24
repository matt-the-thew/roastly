create table public.cafe_images (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes(id) on delete cascade,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_cafe_images_cafe_id on public.cafe_images(cafe_id, display_order);

alter table public.cafe_images enable row level security;

-- Public read
create policy "cafe_images_public_read"
  on public.cafe_images for select
  using (true);

-- Admin-only write (service role bypasses RLS; no policy grants insert to anon/authenticated)
