-- Supabase Migrations for Milestone 2: Roles & Invites (RBAC)

-- 1. Define custom role type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('Admin', 'Manager', 'Trainer', 'Member');
  end if;
end;
$$;

-- 2. Alter public.users table to include role column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'users' and column_name = 'role') then
    alter table public.users add column role public.user_role not null default 'Member';
  end if;
end;
$$;

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

-- 4. Enable RLS on invites table
alter table public.invites enable row level security;

-- 5. Helper function to check role safely
create or replace function public.get_user_role(user_id uuid)
returns public.user_role as $$
declare
  r public.user_role;
begin
  select role into r from public.users where id = user_id;
  return coalesce(r, 'Member'::public.user_role);
end;
$$ language plpgsql security definer;

-- 6. Trigger to prevent users from modifying their own or other roles unless they are Admin
create or replace function public.check_role_update()
returns trigger as $$
begin
  if old.role <> new.role then
    -- Only Admins can change roles
    if public.get_user_role(auth.uid()) <> 'Admin'::public.user_role then
      raise exception 'Only Admins can change user roles.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Apply trigger to public.users
drop trigger if exists tr_check_role_update on public.users;
create trigger tr_check_role_update
  before update on public.users
  for each row execute procedure public.check_role_update();

-- 7. RLS Policies for public.users (role-based)
drop policy if exists "Allow admins to delete users" on public.users;
create policy "Allow admins to delete users" on public.users
  for delete using (public.get_user_role(auth.uid()) = 'Admin'::public.user_role);

-- 8. RLS Policies for public.invites
drop policy if exists "Allow staff to select invites" on public.invites;
create policy "Allow staff to select invites" on public.invites
  for select using (
    public.get_user_role(auth.uid()) in ('Admin'::public.user_role, 'Manager'::public.user_role)
  );

drop policy if exists "Allow admins to insert invites" on public.invites;
create policy "Allow admins to insert invites" on public.invites
  for insert with check (
    public.get_user_role(auth.uid()) = 'Admin'::public.user_role
  );

drop policy if exists "Allow admins to update invites" on public.invites;
create policy "Allow admins to update invites" on public.invites
  for update using (
    public.get_user_role(auth.uid()) = 'Admin'::public.user_role
  );

drop policy if exists "Allow admins to delete invites" on public.invites;
create policy "Allow admins to delete invites" on public.invites
  for delete using (
    public.get_user_role(auth.uid()) = 'Admin'::public.user_role
  );

-- 9. RPC Function for public invite checks (token lookup without raw select access)
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

-- 10. Automatically assign first registered user as Admin
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
      
      -- Mark invite as accepted
      update public.invites set status = 'accepted' where id = invite_id;
    else
      assigned_role := 'Member'::public.user_role;
    end if;
  end if;

  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    assigned_role
  );
  return new;
end;
$$ language plpgsql security definer;
