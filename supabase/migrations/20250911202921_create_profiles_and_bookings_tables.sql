create table public.profiles (
  id uuid references auth.users not null primary key,
  first_name text,
  last_name text,
  email text
);

create table public.bookings (
  id uuid not null default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now(),
  lesson_date date,
  lesson_time time,
  user_id uuid references public.profiles(id) on delete cascade not null
);

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;