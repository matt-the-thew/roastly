create extension if not exists pgcrypto;

-- Friend code generator: returns a unique 7-char uppercase alphanumeric string
-- Good to 78,364,164,096 users
create or replace function generate_friend_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code text := '';
  i int;
  attempt int := 0;
begin
  loop
    code := '';
    for i in 1..7 loop
      code := code || substr(chars, floor(random() * 36)::int + 1, 1);
    end loop;
    -- Check uniqueness
    if not exists (select 1 from public.profiles where friend_code = code) then
      return code;
    end if;
    attempt := attempt + 1;
    if attempt > 100 then
      raise exception 'Could not generate unique friend code after 100 attempts';
    end if;
  end loop;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default '',
  bio text default '' check (char_length(bio) <= 200),
  avatar_url text default '',
  friend_code text unique not null default '',
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-populate friend_code on insert if not provided
create or replace function set_friend_code()
returns trigger
language plpgsql
as $$
begin
  if new.friend_code = '' or new.friend_code is null then
    new.friend_code := generate_friend_code();
  end if;
  return new;
end;
$$;

create trigger trg_set_friend_code
  before insert on public.profiles
  for each row execute function set_friend_code();

-- RLS
alter table public.profiles enable row level security;

-- Anyone can read public fields (enforced in application layer via view/select)
create policy "profiles_public_read"
  on public.profiles for select
  using (true);

-- Users can only insert/update their own profile
create policy "profiles_own_insert"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_own_update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_own_delete"
  on public.profiles for delete
  using (id = auth.uid());
