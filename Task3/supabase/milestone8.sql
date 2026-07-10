-- Supabase Migrations for Milestone 8: Class Scheduling & Bookings

-- Create classes table
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  instructor text not null,
  location text not null,
  category text not null, -- 'Yoga', 'HIIT', 'Pilates', 'Strength'
  start_time timestamp with time zone not null,
  duration_minutes integer not null,
  capacity integer not null default 20,
  created_at timestamp with time zone default now() not null
);

-- Create class bookings table
create table if not exists public.class_bookings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  unique(class_id, user_id)
);

-- Enable RLS
alter table public.classes enable row level security;
alter table public.class_bookings enable row level security;

-- Policies for classes
create policy "Anyone can view classes"
  on public.classes for select
  to authenticated
  using (true);

create policy "Staff manage classes"
  on public.classes for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('Admin', 'Manager')
    )
  );

-- Policies for bookings
create policy "Staff read all bookings"
  on public.class_bookings for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('Admin', 'Manager')
    )
  );

create policy "Members read own bookings"
  on public.class_bookings for select
  to authenticated
  using (user_id = auth.uid());

create policy "Members manage own bookings"
  on public.class_bookings for all
  to authenticated
  using (user_id = auth.uid());
