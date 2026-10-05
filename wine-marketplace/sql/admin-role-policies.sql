-- Role-based Row Level Security policies. Run this AFTER the other schema and policy scripts.
-- It replaces the earlier "any authenticated user" policies with admin-only ones.
--
-- Admins are users whose app_metadata contains {"role": "admin"}. Users cannot edit
-- app_metadata themselves (unlike user_metadata). To make someone an admin, run:
--
--   update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
--   where email = 'admin@example.com';
--
-- The user must sign out and back in afterwards so their token carries the new claim.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- orders: customers insert and read their own orders; only admins see or change all of them.
drop policy if exists "Allow all authenticated users to view all orders" on orders;
drop policy if exists "Allow all authenticated users to update all orders" on orders;
drop policy if exists "Allow users to update their own orders" on orders;
drop policy if exists "Allow any authenticated user to insert orders" on orders;
drop policy if exists "Allow authenticated users to insert orders" on orders;
drop policy if exists "Users can insert their own orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
drop policy if exists "Admins can update all orders" on orders;

create policy "Users can insert their own orders"
  on orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on orders for select
  using (public.is_admin());

create policy "Admins can update all orders"
  on orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- wines: everyone can read; only admins can write.
drop policy if exists "Allow authenticated users to insert wines" on wines;
drop policy if exists "Allow authenticated users to update wines" on wines;
drop policy if exists "Allow authenticated users to delete wines" on wines;
drop policy if exists "Admins can insert wines" on wines;
drop policy if exists "Admins can update wines" on wines;
drop policy if exists "Admins can delete wines" on wines;

create policy "Admins can insert wines"
  on wines for insert
  with check (public.is_admin());

create policy "Admins can update wines"
  on wines for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete wines"
  on wines for delete
  using (public.is_admin());

-- users: each user sees their own row; only admins can list everyone (the admin order page shows the buyer's email).
drop policy if exists "Authenticated users can view all users" on users;
drop policy if exists "Admins can view all users" on users;

create policy "Admins can view all users"
  on users for select
  using (public.is_admin());

-- purchased_wines: the per-user insert policy already exists; drop the one that let anyone insert rows for any user.
drop policy if exists "Authenticated users can insert purchased wines" on purchased_wines;
