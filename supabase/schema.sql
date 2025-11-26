-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Public profile info)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Secure the profiles table
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. SERVICES (Recurring bills)
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  provider text,
  account_number text,
  cut_off_day integer check (cut_off_day between 1 and 31),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secure the services table
alter table public.services enable row level security;

create policy "Users can view own services."
  on services for select
  using ( auth.uid() = user_id );

create policy "Users can insert own services."
  on services for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own services."
  on services for update
  using ( auth.uid() = user_id );

create policy "Users can delete own services."
  on services for delete
  using ( auth.uid() = user_id );

-- 3. PAYMENTS (Monthly bills)
create type payment_status as enum ('pending', 'paid', 'verified');

create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  service_id uuid references public.services(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount decimal(10, 2),
  due_date date not null,
  status payment_status default 'pending',
  proof_url text,
  paid_by uuid references public.profiles(id), -- Who actually paid (owner or helper)
  share_token uuid default uuid_generate_v4(), -- Token for sharing this specific payment
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Secure the payments table
alter table public.payments enable row level security;

create policy "Users can view own payments."
  on payments for select
  using ( auth.uid() = user_id );

create policy "Users can insert own payments."
  on payments for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own payments."
  on payments for update
  using ( auth.uid() = user_id );

-- Policy for "Helpers" (Access via Share Token)
-- Note: This requires a secure function or specific query logic in the app.
-- For simplicity in MVP, we allow update if you have the ID, but in a real app 
-- we would enforce the token check via a Database Function (RPC).
-- For now, we keep it strict: Only owner can update. 
-- The "Help" feature will be implemented via a secure API route (Server Action) that bypasses RLS using service_role key 
-- strictly for the specific operation of "paying with token".

-- 4. TRIGGERS (Auto-create profile)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
