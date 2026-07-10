-- Supabase Migrations for Milestone 6: Members/Customers List

-- Alter public.users table to include Authorize.net Customer Profile ID
alter table public.users add column if not exists authorize_net_customer_id text;
