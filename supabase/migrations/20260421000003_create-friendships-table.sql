create type friendship_status as enum ('pending', 'accepted', 'denied');

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  constraint friendships_unique_pair unique (requester_id, addressee_id),
  constraint friendships_no_self check (requester_id != addressee_id)
);

-- Index for fast lookup of all friendships involving a user
create index idx_friendships_addressee on public.friendships(addressee_id);
create index idx_friendships_requester on public.friendships(requester_id);

alter table public.friendships enable row level security;

-- Only the two parties can see a friendship row
create policy "friendships_parties_read"
  on public.friendships for select
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- Any authenticated user can send a request (insert as requester)
create policy "friendships_insert"
  on public.friendships for insert
  with check (requester_id = auth.uid());

-- Only the addressee can update status (accept/deny)
create policy "friendships_addressee_update"
  on public.friendships for update
  using (addressee_id = auth.uid())
  with check (addressee_id = auth.uid());

-- Either party can delete (unfriend or withdraw request)
create policy "friendships_parties_delete"
  on public.friendships for delete
  using (requester_id = auth.uid() or addressee_id = auth.uid());

-- Helper view: accepted friendships as symmetric pairs
create view public.friends as
  select requester_id as user_id, addressee_id as friend_id
  from public.friendships where status = 'accepted'
  union all
  select addressee_id as user_id, requester_id as friend_id
  from public.friendships where status = 'accepted';
