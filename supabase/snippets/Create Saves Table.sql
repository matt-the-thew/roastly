create table saves (
  user_id uuid references auth.users(id) on delete cascade,
  cafe_id uuid references cafes(id) on delete cascade,

  created_at timestamp with time zone default now(),

  primary key (user_id, cafe_id)
);