-- Supabase Migrations for Milestone 7: Member Check-In

-- Create check-in log table
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  checked_in_at timestamp with time zone default now() not null,
  checked_in_by uuid references public.users(id) on delete set null
);

-- Enable RLS
alter table public.checkins enable row level security;

-- Policies: Admin and Manager can do all
create policy "Staff manage checkins"
  on public.checkins
  for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('Admin', 'Manager')
    )
  );

-- Policies: Members can read their own checkins
create policy "Members read own checkins"
  on public.checkins
  for select
  to authenticated
  using (user_id = auth.uid());
