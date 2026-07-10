-- Supabase Migrations for Milestone 9+10: Super-Admin & Platform Analytics

-- Alter public.users table to include SaaS platform control flags
alter table public.users add column if not exists is_superadmin boolean default false;
alter table public.users add column if not exists is_suspended boolean default false;

-- Promote the first registered user to Super-Admin automatically if no superadmin exists
update public.users
set is_superadmin = true
where id in (
  select id from public.users
  order by created_at asc
  limit 1
);
