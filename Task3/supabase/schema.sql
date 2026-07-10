-- Database schema initialization for Auric Gym & Fitness SaaS platform

-- Create public.users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users table
alter table public.users enable row level security;

-- Drop existing policies if any
drop policy if exists "Allow public read access to users" on public.users;
drop policy if exists "Allow users to update their own record" on public.users;

-- Create policies for public.users
create policy "Allow public read access to users" on public.users
  for select using (true);

create policy "Allow users to update their own record" on public.users
  for update using (auth.uid() = id);

-- Create a trigger function to automatically create a public.users row when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
