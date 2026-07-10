-- Consolidated Database Schema Initialization for Auric SaaS Platform
-- Run this script in your Supabase SQL Editor to set up all tables, roles, triggers, and RLS policies!

-- 1. Create role enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('Admin', 'Manager', 'Trainer', 'Member');
  end if;
end;
$$;

-- 2. Create users profile table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'Member',
  gym_name text,
  subdomain text unique,
  phone text,
  address text,
  authorize_net_customer_id text,
  is_superadmin boolean default false,
  is_suspended boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Policies for users
drop policy if exists "Allow public read access to users" on public.users;
create policy "Allow public read access to users" on public.users
  for select to authenticated using (true);

drop policy if exists "Allow users to update their own record" on public.users;
create policy "Allow users to update their own record" on public.users
  for update to authenticated using (auth.uid() = id);

drop policy if exists "Allow admins to delete users" on public.users;
create policy "Allow admins to delete users" on public.users
  for delete to authenticated using (role = 'Admin');

-- 3. Create invites table
create table if not exists public.invites (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  role public.user_role not null,
  invited_by uuid references auth.users(id) on delete set null,
  token text not null unique,
  status text not null default 'pending', -- 'pending', 'accepted', 'revoked'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Enable RLS on invites
alter table public.invites enable row level security;

-- 4. Create products table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric(10, 2) not null,
  type text not null, -- 'full_access', 'visit_count', 'time_based', 'class_count_periodic'
  visits_limit integer,
  duration_type text not null, -- 'ongoing', 'limited_time', 'periodic'
  duration_months integer,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  payment_model text not null, -- 'one_time', 'recurring'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on products
alter table public.products enable row level security;

-- 5. Create waivers table
create table if not exists public.waivers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null, -- markdown or plain text with tokens like {first_name}, {last_name}, {date}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on waivers
alter table public.waivers enable row level security;

-- 6. Create signup forms table
create table if not exists public.signup_forms (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  is_active boolean not null default true,
  waiver_id uuid references public.waivers(id) on delete set null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on signup forms
alter table public.signup_forms enable row level security;

-- 7. Create signup_form_products junction table
create table if not exists public.signup_form_products (
  signup_form_id uuid references public.signup_forms(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  primary key (signup_form_id, product_id)
);

-- Enable RLS on signup form products
alter table public.signup_form_products enable row level security;

-- 8. Create member_products (subscriptions/purchases) table
create table if not exists public.member_products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  status text not null default 'active', -- 'active', 'cancelled', 'expired', 'refunded'
  remaining_visits integer,
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  end_date timestamp with time zone,
  auth_net_subscription_id text, -- Authorize.net Automated Recurring Billing Subscription ID
  auth_net_profile_id text, -- Authorize.net Customer Profile ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on member products
alter table public.member_products enable row level security;

-- 9. Create waiver_agreements (signed agreements) table
create table if not exists public.waiver_agreements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  waiver_id uuid references public.waivers(id) on delete cascade,
  signed_content text not null,
  signed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on waiver agreements
alter table public.waiver_agreements enable row level security;

-- 10. Create checkins table
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  checked_in_at timestamp with time zone default now() not null,
  checked_in_by uuid references public.users(id) on delete set null
);

-- Enable RLS on checkins
alter table public.checkins enable row level security;

-- 11. Create classes table
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

-- Enable RLS on classes
alter table public.classes enable row level security;

-- 12. Create class bookings table
create table if not exists public.class_bookings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  unique(class_id, user_id)
);

-- Enable RLS on bookings
alter table public.class_bookings enable row level security;

-- ==========================================
-- helper function to check role safely
-- ==========================================
create or replace function public.get_user_role(user_id uuid)
returns public.user_role as $$
declare
  r public.user_role;
begin
  select role into r from public.users where id = user_id;
  return coalesce(r, 'Member'::public.user_role);
end;
$$ language plpgsql security definer;

-- ==========================================
-- Triggers and security helpers
-- ==========================================

-- Trigger to prevent users from modifying roles unless Admin
create or replace function public.check_role_update()
returns trigger as $$
begin
  if old.role <> new.role then
    if public.get_user_role(auth.uid()) <> 'Admin'::public.user_role then
      raise exception 'Only Admins can change user roles.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_check_role_update on public.users;
create trigger tr_check_role_update
  before update on public.users
  for each row execute procedure public.check_role_update();

-- Automatic profile creation and role assignment trigger on sign up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
  assigned_role public.user_role;
  active_invite_role public.user_role;
  invite_id uuid;
begin
  -- Check if any users exist in public.users
  select not exists (select 1 from public.users) into is_first_user;
  
  if is_first_user then
    assigned_role := 'Admin'::public.user_role;
  else
    -- Check if there is an active invite matching this user's email
    select i.role, i.id into active_invite_role, invite_id
    from public.invites i
    where i.email = new.email and i.status = 'pending' and i.expires_at > now()
    limit 1;
    
    if active_invite_role is not null then
      assigned_role := active_invite_role;
      update public.invites set status = 'accepted' where id = invite_id;
    else
      assigned_role := 'Admin'::public.user_role;
    end if;
  end if;

  insert into public.users (id, email, full_name, avatar_url, role, is_superadmin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    assigned_role,
    is_first_user -- First user is Super Admin
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- Setup RLS Policies for all tables
-- ==========================================

-- Invites RLS
drop policy if exists "Allow staff to select invites" on public.invites;
create policy "Allow staff to select invites" on public.invites
  for select to authenticated using (public.get_user_role(auth.uid()) in ('Admin', 'Manager'));

drop policy if exists "Allow admins to insert invites" on public.invites;
create policy "Allow admins to insert invites" on public.invites
  for insert to authenticated with check (public.get_user_role(auth.uid()) = 'Admin');

drop policy if exists "Allow admins to update invites" on public.invites;
create policy "Allow admins to update invites" on public.invites
  for update to authenticated using (public.get_user_role(auth.uid()) = 'Admin');

drop policy if exists "Allow admins to delete invites" on public.invites;
create policy "Allow admins to delete invites" on public.invites
  for delete to authenticated using (public.get_user_role(auth.uid()) = 'Admin');

-- RPC lookup
create or replace function public.get_invite_by_token(token_text text)
returns table (
  id uuid,
  email text,
  role public.user_role,
  status text,
  expires_at timestamp with time zone
) as $$
begin
  return query
  select i.id, i.email, i.role, i.status, i.expires_at
  from public.invites i
  where i.token = token_text;
end;
$$ language plpgsql security definer;

-- Products RLS
drop policy if exists "Allow public read access to products" on public.products;
create policy "Allow public read access to products" on public.products
  for select to authenticated using (true);

drop policy if exists "Allow admins to modify products" on public.products;
create policy "Allow admins to modify products" on public.products
  for all to authenticated using (public.get_user_role(auth.uid()) = 'Admin');

-- Waivers RLS
drop policy if exists "Allow public read access to waivers" on public.waivers;
create policy "Allow public read access to waivers" on public.waivers
  for select to authenticated using (true);

drop policy if exists "Allow admins to modify waivers" on public.waivers;
create policy "Allow admins to modify waivers" on public.waivers
  for all to authenticated using (public.get_user_role(auth.uid()) = 'Admin');

-- Signup Forms RLS
drop policy if exists "Allow public read access to active signup forms" on public.signup_forms;
create policy "Allow public read access to active signup forms" on public.signup_forms
  for select to authenticated using (is_active = true or public.get_user_role(auth.uid()) in ('Admin', 'Manager'));

drop policy if exists "Allow admins to modify signup forms" on public.signup_forms;
create policy "Allow admins to modify signup forms" on public.signup_forms
  for all to authenticated using (public.get_user_role(auth.uid()) = 'Admin');

-- Junction RLS
drop policy if exists "Allow public read access to form products" on public.signup_form_products;
create policy "Allow public read access to form products" on public.signup_form_products
  for select to authenticated using (true);

drop policy if exists "Allow admins to modify form products" on public.signup_form_products;
create policy "Allow admins to modify form products" on public.signup_form_products
  for all to authenticated using (public.get_user_role(auth.uid()) = 'Admin');

-- Member Products RLS
drop policy if exists "Allow users to view own purchased products" on public.member_products;
create policy "Allow users to view own purchased products" on public.member_products
  for select to authenticated using (auth.uid() = user_id or public.get_user_role(auth.uid()) in ('Admin', 'Manager'));

drop policy if exists "Allow public to insert purchases during checkout" on public.member_products;
create policy "Allow public to insert purchases during checkout" on public.member_products
  for insert with check (true);

drop policy if exists "Allow admins to modify member products" on public.member_products;
create policy "Allow admins to modify member products" on public.member_products
  for all to authenticated using (public.get_user_role(auth.uid()) = 'Admin');

-- Waiver Agreements RLS
drop policy if exists "Allow users to view own signed waivers" on public.waiver_agreements;
create policy "Allow users to view own signed waivers" on public.waiver_agreements
  for select to authenticated using (auth.uid() = user_id or public.get_user_role(auth.uid()) in ('Admin', 'Manager'));

drop policy if exists "Allow public to insert agreements during checkout" on public.waiver_agreements;
create policy "Allow public to insert agreements during checkout" on public.waiver_agreements
  for insert with check (true);

-- Checkins RLS
drop policy if exists "Staff manage checkins" on public.checkins;
create policy "Staff manage checkins" on public.checkins
  for all to authenticated using (public.get_user_role(auth.uid()) in ('Admin', 'Manager'));

drop policy if exists "Members read own checkins" on public.checkins;
create policy "Members read own checkins" on public.checkins
  for select to authenticated using (user_id = auth.uid());

-- Classes RLS
drop policy if exists "Anyone can view classes" on public.classes;
create policy "Anyone can view classes" on public.classes
  for select to authenticated using (true);

drop policy if exists "Staff manage classes" on public.classes;
create policy "Staff manage classes" on public.classes
  for all to authenticated using (public.get_user_role(auth.uid()) in ('Admin', 'Manager'));

-- Bookings RLS
drop policy if exists "Staff read all bookings" on public.class_bookings;
create policy "Staff read all bookings" on public.class_bookings
  for select to authenticated using (public.get_user_role(auth.uid()) in ('Admin', 'Manager'));

drop policy if exists "Members read own bookings" on public.class_bookings;
create policy "Members read own bookings" on public.class_bookings
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "Members manage own bookings" on public.class_bookings;
create policy "Members manage own bookings" on public.class_bookings
  for all to authenticated using (user_id = auth.uid());
