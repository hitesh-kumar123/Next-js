-- Supabase Migrations for Milestone 3+4: Products, Waivers, Forms, Payments & Subdomains

-- 1. Create products table
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

-- 2. Create waivers table
create table if not exists public.waivers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null, -- Markdown/HTML with tokens like {first_name}, {last_name}, {date}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create signup forms table
create table if not exists public.signup_forms (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  is_active boolean not null default true,
  waiver_id uuid references public.waivers(id) on delete set null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create signup_form_products junction table
create table if not exists public.signup_form_products (
  signup_form_id uuid references public.signup_forms(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  primary key (signup_form_id, product_id)
);

-- 5. Create member_products (subscriptions/purchases) table
create table if not exists public.member_products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  status text not null default 'active', -- 'active', 'cancelled', 'expired'
  remaining_visits integer,
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  end_date timestamp with time zone,
  auth_net_subscription_id text, -- Authorize.net Automated Recurring Billing Subscription ID
  auth_net_profile_id text, -- Authorize.net Customer Profile ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create waiver_agreements (signed agreements) table
create table if not exists public.waiver_agreements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  waiver_id uuid references public.waivers(id) on delete cascade,
  signed_content text not null,
  signed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Add gym subdomain and info fields to public.users
alter table public.users add column if not exists gym_name text;
alter table public.users add column if not exists subdomain text unique;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists address text;

-- 8. Enable Row Level Security (RLS) on new tables
alter table public.products enable row level security;
alter table public.waivers enable row level security;
alter table public.signup_forms enable row level security;
alter table public.signup_form_products enable row level security;
alter table public.member_products enable row level security;
alter table public.waiver_agreements enable row level security;

-- 9. Setup RLS Policies

-- Products RLS
drop policy if exists "Allow public read access to products" on public.products;
create policy "Allow public read access to products" on public.products
  for select using (true);

drop policy if exists "Allow admins to modify products" on public.products;
create policy "Allow admins to modify products" on public.products
  for all using (public.get_user_role(auth.uid()) = 'Admin'::public.user_role);

-- Waivers RLS
drop policy if exists "Allow public read access to waivers" on public.waivers;
create policy "Allow public read access to waivers" on public.waivers
  for select using (true);

drop policy if exists "Allow admins to modify waivers" on public.waivers;
create policy "Allow admins to modify waivers" on public.waivers
  for all using (public.get_user_role(auth.uid()) = 'Admin'::public.user_role);

-- Signup Forms RLS
drop policy if exists "Allow public read access to active signup forms" on public.signup_forms;
create policy "Allow public read access to active signup forms" on public.signup_forms
  for select using (is_active = true or public.get_user_role(auth.uid()) in ('Admin'::public.user_role, 'Manager'::public.user_role));

drop policy if exists "Allow admins to modify signup forms" on public.signup_forms;
create policy "Allow admins to modify signup forms" on public.signup_forms
  for all using (public.get_user_role(auth.uid()) = 'Admin'::public.user_role);

-- Signup Form Products junction RLS
drop policy if exists "Allow public read access to form products" on public.signup_form_products;
create policy "Allow public read access to form products" on public.signup_form_products
  for select using (true);

drop policy if exists "Allow admins to modify form products" on public.signup_form_products;
create policy "Allow admins to modify form products" on public.signup_form_products
  for all using (public.get_user_role(auth.uid()) = 'Admin'::public.user_role);

-- Member Products (Purchases) RLS
drop policy if exists "Allow users to view own purchased products" on public.member_products;
create policy "Allow users to view own purchased products" on public.member_products
  for select using (auth.uid() = user_id or public.get_user_role(auth.uid()) in ('Admin'::public.user_role, 'Manager'::public.user_role));

drop policy if exists "Allow public to insert purchases during checkout" on public.member_products;
create policy "Allow public to insert purchases during checkout" on public.member_products
  for insert with check (true); -- Trigger/Checkout handles registration

drop policy if exists "Allow admins to modify member products" on public.member_products;
create policy "Allow admins to modify member products" on public.member_products
  for all using (public.get_user_role(auth.uid()) = 'Admin'::public.user_role);

-- Waiver Agreements (Signed waivers) RLS
drop policy if exists "Allow users to view own signed waivers" on public.waiver_agreements;
create policy "Allow users to view own signed waivers" on public.waiver_agreements
  for select using (auth.uid() = user_id or public.get_user_role(auth.uid()) in ('Admin'::public.user_role, 'Manager'::public.user_role));

drop policy if exists "Allow public to insert agreements during checkout" on public.waiver_agreements;
create policy "Allow public to insert agreements during checkout" on public.waiver_agreements
  for insert with check (true);
